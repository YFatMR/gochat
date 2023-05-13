import { FC, useContext, useState, useEffect, useRef, MouseEvent } from "react";
import { useNavigate } from 'react-router-dom';
import { Chat } from "../components/chat/Chat";
import { Message, MessageProps } from "../components/chat/Message";
import ContextMenu from "../components/chat/ContextMenu";
import { ChatService } from "../services/ChatService";
import { ChatsResponse, MessagesResponse, ChatInfo, Dialog, MessageInfo, MessageResponse, NewMessageWSEvent, ViewedMessageWSEvent } from "../types/Chats"
import "../styles/css/Chats.css";
import Observer from "../components/common/Observer";
import sendMessageActive from "../assets/sendMessageActive.png";
import { API_HOST } from "../http/index"
import useWebSocket from 'react-use-websocket';
import autosize from 'autosize';

const chatInfoFromResponse = (dialog: Dialog): ChatInfo => {
    return {
        id: parseInt(dialog.dialogID.ID),
        name: dialog.name,
        unreadMessagesCount: parseInt(dialog.unreadMessagesCount),
        lastMessage: {
            id: parseInt(dialog.lastMessage.messageID.ID),
            text: dialog.lastMessage.text,
            createdAt: new Date(dialog.lastMessage.createdAt),
            selfMessage: dialog.lastMessage.selfMessage,
            viewed: dialog.lastMessage.viewed,
        },
        lastReadMessage: {
            id: parseInt(dialog.lastReadMessage.messageID.ID),
            text: dialog.lastReadMessage.text,
            createdAt: new Date(dialog.lastReadMessage.createdAt),
            selfMessage: dialog.lastReadMessage.selfMessage,
            viewed: dialog.lastReadMessage.viewed,
        },
    }
}


const chatsFromResponse = (response: ChatsResponse): ChatInfo[] => {
    return response.dialogs ? response.dialogs.map(dialog => {
        return chatInfoFromResponse(dialog)
    }) : []
}


const messageInfoFromResponse = (message: MessageResponse): MessageInfo => {
    return {
        id: parseInt(message.messageID.ID),
        text: message.text,
        createdAt: new Date(message.createdAt),
        selfMessage: message.selfMessage,
        viewed: message.viewed,
        lastMessageObserver: null,
    }
}


const messagesInfoFromResponse = (response: MessagesResponse): MessageInfo[] => {
    return response.messages ? response.messages.map(message => {
        return messageInfoFromResponse(message)
    }) : []
}

enum MessageWindowState {
    SELECTABLE,
    NORMAL,
}


const ChatsPage: FC = () => {
    const navigate = useNavigate();
    const [chats, setChats] = useState<ChatInfo[]>([]);
    const [messages, setMessages] = useState<MessageInfo[]>([]);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const messageTextarea = useRef<HTMLTextAreaElement>(null);
    const [prevScrollHeight, setPrevScrollHeight] = useState(0);

    const [fetchingDialogs, setFetchingDialogs] = useState<boolean>(false);

    const [lastReadMessage, setLastReadMessage] = useState<MessageInfo | null>(null);

    const [firstMessagesLoad, setFirstMessagesLoad] = useState<boolean>(false);

    const [activeDialog, setActiveDialog] = useState<ChatInfo | null>(null);
    const messagesBottomRef = useRef<HTMLDivElement>(null);
    const lastViewedMessageRef = useRef<HTMLDivElement>(null);

    const [messageWindowState, setMessageWindowState] = useState<MessageWindowState>(MessageWindowState.NORMAL);
    const [showMenu, setShowMenu] = useState<Boolean>(false);
    const [menuPosition, setMenuPosition] = useState<Record<string, number>>({ x: 0, y: 0 });

    const handleContextMenu = (event: MouseEvent<HTMLDivElement>) => {
        event.preventDefault();

        if (showMenu) {
            handleCloseMenu();
            return;
        }

        setMenuPosition({ x: event.clientX, y: event.clientY });

        setShowMenu(true);
    };

    const handleCloseMenu = () => {
        setShowMenu(false);
    };

    useEffect(() => {
        handleCloseMenu();
    }, [activeDialog?.id])


    const menuStyle = {
        position: 'fixed',
        top: `${menuPosition.y}px`,
        left: `${menuPosition.x}px`
    } as React.CSSProperties;

    const [messageText, setMessageText] = useState<string>('');

    const { sendJsonMessage, lastJsonMessage } = useWebSocket(`ws://${API_HOST}/v1/ws?token=${localStorage.getItem('token')}`, {
        onOpen: () => console.log('WebSocket opened'),
        onClose: () => console.log('WebSocket closed'),
        onError: (event) => console.error('WebSocket error:', event),
        onMessage: async (data: any) => {
            const parsedData = JSON.parse(data.data)
            console.log("Websocket event", parsedData)
            if (parsedData.type === "new_message") {
                const newMessageEvent = parsedData as NewMessageWSEvent

                // update dialog list order
                var newChats = [...chats]
                const existChatIdx = newChats.findIndex(chat => chat.id == newMessageEvent.dialogID.ID)
                if (existChatIdx === -1) {
                    // load dialog
                    const newDialog = await ChatService.getDialogByID(newMessageEvent.dialogID.ID)
                    newChats = [chatInfoFromResponse(newDialog.data), ...newChats]
                } else {
                    // set new params
                    newChats[existChatIdx].lastMessage = {
                        id: newMessageEvent.messageID.ID,
                        text: newMessageEvent.text,
                        createdAt: new Date(newMessageEvent.createdAt),
                        selfMessage: false, // only other members messages
                        viewed: false,
                    }
                }
                newChats.sort((a: ChatInfo, b: ChatInfo) => {
                    return b.lastMessage.createdAt.getTime() - a.lastMessage.createdAt.getTime()
                });
                setChats(newChats)

                const messageToCurrentDialog = activeDialog !== null && activeDialog.id == newMessageEvent.dialogID.ID
                if (!messageToCurrentDialog) {
                    // ignore if not current dialog message
                    return
                }
                const message = {
                    id: newMessageEvent.messageID.ID,
                    text: newMessageEvent.text,
                    createdAt: new Date(newMessageEvent.createdAt),
                    selfMessage: false,
                    viewed: false, // someone else's message that the user has not yet seen
                    lastMessageObserver: null,
                }
                if (messagesContainerRef.current) {
                    setPrevScrollHeight(messagesContainerRef.current.scrollHeight);
                }
                setMessages([...messages, message])
                console.log('WebSocket data', data)
            } else if (parsedData.type === "viewed") {
                const viewedMessageEvent = parsedData as ViewedMessageWSEvent
                const activeDialogAction = activeDialog !== null && activeDialog.id == viewedMessageEvent.dialogID.ID
                if (!activeDialogAction || !messagesContainerRef.current) {
                    // ignore if not current dialog event
                    return
                }
                const newMessages = [...messages].map((message) => {
                    if (message.viewed && message.selfMessage) {
                        return message
                    }
                    message.viewed = message.createdAt <= new Date(viewedMessageEvent.messageCreatedAt)
                    return message
                })
                setPrevScrollHeight(messagesContainerRef.current.scrollTop);
                setMessages([...newMessages])
                return
            } else {
                console.error("Websocket unknown event with type", parsedData)
                return
            }

        },
        shouldReconnect: (closeEvent) => true,
        reconnectAttempts: 10,
        reconnectInterval: 3000,
    });

    const dialogMessagesPerRequest = 40;
    const chatsCountPerRequest = 30

    useEffect(() => {
        if (!messagesContainerRef.current) {
            return
        }
        messagesContainerRef.current.scrollTop = prevScrollHeight
    }, [messages])


    const handleDialogClick = async (chat: ChatInfo): Promise<void> => {
        const newMessagesResponse = await ChatService.getMessagesBeforeAndInclude(chat.id, chat.lastReadMessage.id, dialogMessagesPerRequest);
        console.log("newMessagesResponse", newMessagesResponse)
        if (newMessagesResponse.status != 200) {
            return
        }
        const newMessages = messagesInfoFromResponse(newMessagesResponse.data)
        setActiveDialog(chat)
        if (newMessages.length === 0) {
            return
        }
        newMessages[newMessages.length - 1].lastMessageObserver = lastViewedMessageRef
        setLastReadMessage(newMessages[newMessages.length - 1])


        setMessages(newMessages)
        setFirstMessagesLoad(true)

        console.log("SCROLLING!!!", messagesBottomRef.current, firstMessagesLoad)
        console.log("ACTIVE DIALOG last read message", chat.lastReadMessage.text)
    }


    useEffect(() => {
        console.log("EFFECT", messagesBottomRef.current, firstMessagesLoad)
        if (!messagesBottomRef.current || !firstMessagesLoad) {
            return
        }
        messagesBottomRef.current.scrollIntoView();
        setFirstMessagesLoad(false)
    }, [firstMessagesLoad])

    const fetchBottomChats = async () => {
        const response = await ChatService.getDialogs(chatsCountPerRequest, chats.length);
        console.log("fetchBottomChats response", response, "chat length", chats.length)
        if (response.status != 200) {
            navigate("")
            return
        }
        const newChats = chatsFromResponse(response.data)
        if (newChats.length === 0) {
            return
        }
        if (chats.length === 0) {
            setChats(newChats)
            return
        }
        setChats([...chats, ...newChats]);
    }

    const fetchTopDialogMessages = async (chatID: number, topMessageID: number): Promise<MessageInfo[]> => {
        const response = await ChatService.getMessagesBefore(chatID, topMessageID, dialogMessagesPerRequest);
        if (response.status != 200) {
            navigate("")
            return []
        }
        return messagesInfoFromResponse(response.data)
    }

    const fetchBottomDialogMessages = async (chatID: number, bottomMessageID: number): Promise<MessageInfo[]> => {
        const response = await ChatService.getMessagesAfter(chatID, bottomMessageID, dialogMessagesPerRequest);
        if (response.status != 200) {
            navigate("")
            return []
        }
        return messagesInfoFromResponse(response.data)
    }

    const sendMessage = async (chatID: number, text: string) => {
        if (text === "") {
            return
        }
        const response = await ChatService.sendMessage(chatID, text)
        if (response.status !== 200) {
            return
        }
        const newMessage = messageInfoFromResponse({
            messageID: {
                ID: response.data.messageID.ID,
            },
            senderID: {
                ID: "0",
            },
            text: text,
            createdAt: response.data.createdAt,
            selfMessage: true,
            viewed: false,
        })
        setMessages([...messages, newMessage]);

        const newChats = [...chats].map((chat) => {
            if (chat.id !== activeDialog?.id) {
                return chat
            }
            chat.lastMessage = {
                id: newMessage.id,
                text: newMessage.text,
                createdAt: newMessage.createdAt,
                selfMessage: newMessage.selfMessage,
                viewed: newMessage.viewed,
            }
            return chat
        }).sort((a: ChatInfo, b: ChatInfo) => {
            return b.lastMessage.createdAt.getTime() - a.lastMessage.createdAt.getTime()
        });
        setChats(newChats)
    }

    // init list of dialogs
    useEffect(() => {
        fetchBottomChats();

        if (messageTextarea.current) {
            autosize(messageTextarea.current);
        }

        const handleDocumentClick = () => {
            handleCloseMenu()
        };

        window.addEventListener('click', handleDocumentClick);

        return () => {
            window.removeEventListener('click', handleDocumentClick);
        };
    }, []);

    const onMessageIntercept = async (message: MessageInfo) => {
        if (!messagesContainerRef.current || !activeDialog || !lastReadMessage || message.selfMessage || message.viewed) {
            return
        }
        if (message.createdAt < lastReadMessage.createdAt) {
            return
        }
        // чужое сообщение которое еще не просмотрено
        const response = await ChatService.readAllMessagesBeforeIncl(activeDialog.id, message.id)
        if (response.status !== 200) {
            return
        }
        console.log("intercepted with", message.id)
        if (message.createdAt > lastReadMessage.createdAt) {
            setLastReadMessage(message)
        }
        const newMessages = [...messages].map((message) => {
            if (message.viewed || message.selfMessage) {
                return message
            }
            // чужое сообщение просматриваем
            message.viewed = message.createdAt <= lastReadMessage.createdAt
            return message
        })
        setPrevScrollHeight(messagesContainerRef.current.scrollTop);
        setMessages([...newMessages])
    }

    return (
        <div className="main-container">
            <div className="chats-container">
                {chats.map((chat) => (
                    <Chat
                        key={chat.id.toString()}
                        id={chat.id}
                        name={chat.name}
                        unreadMessagesCount={chat.unreadMessagesCount || 0}
                        lastMessage={{
                            id: chat.lastMessage.id,
                            text: chat.lastMessage.text,
                            createdAt: `${chat.lastMessage.createdAt.getHours()}:${chat.lastMessage.createdAt.getMinutes().toString().padStart(2, '0')}`,
                        }}
                        onClick={() => { return handleDialogClick(chat) }}
                        isActive={activeDialog?.id === chat.id}
                    />
                ))}
                <Observer onIntercept={() => {
                    fetchBottomChats()
                }} />
            </div>
            <div className="right-container">
                {showMenu && <ContextMenu handleCloseMenu={handleCloseMenu} menuStyle={menuStyle} />}
                <div onContextMenu={handleContextMenu} ref={messagesContainerRef} className={`messages-container ${showMenu ? 'messages-container_disable-scroll' : null}`}>
                    {messages.length ?
                        <>
                            <Observer onIntercept={async () => {
                                if (!activeDialog || fetchingDialogs) {
                                    return
                                }
                                setFetchingDialogs(true)
                                const newMessages = await fetchTopDialogMessages(activeDialog.id, messages[0].id)

                                setPrevScrollHeight(messagesContainerRef.current?.scrollTop || 0)
                                setMessages([...newMessages, ...messages]);

                                setFetchingDialogs(false)
                            }} />
                            {messages.map((message) => (
                                <Message
                                    key={message.id.toString()}
                                    text={message.text}
                                    createdAt={`${message.createdAt.getHours()}:${message.createdAt.getMinutes().toString().padStart(2, '0')}`}
                                    selfMessage={message.selfMessage}
                                    id={message.id}
                                    lastMessageObserver={message.lastMessageObserver}
                                    viewed={message.viewed}
                                    onIntercept={() => { onMessageIntercept(message) }}
                                />
                            ))}
                            <div ref={messagesBottomRef}></div>
                            <Observer onIntercept={async () => {
                                if (!activeDialog || messages.length === 0 || fetchingDialogs || messages[messages.length - 1].id === activeDialog.lastMessage.id) {
                                    return
                                }
                                setFetchingDialogs(true)
                                const newMessages = await fetchBottomDialogMessages(activeDialog.id, messages[messages.length - 1].id)
                                console.log('on intersect bottom messages');

                                setPrevScrollHeight(messagesContainerRef.current?.scrollTop || 0)
                                setMessages([...messages, ...newMessages]);

                                setFetchingDialogs(false)
                            }} />
                        </> : <div> There is no messages... </div>}
                </div>
                <div className="current-message-container">
                    <textarea
                        ref={messageTextarea}
                        className="message-textarea"
                        placeholder="Введите текст..."
                        value={messageText}
                        onChange={(event) => { setMessageText(event.target.value); }}
                    />
                    <img
                        className="message-active-image"
                        src={sendMessageActive}
                        onClick={() => {
                            if (!activeDialog) {
                                return
                            }
                            console.log("activeDialogID", activeDialog.id)
                            sendMessage(activeDialog.id, messageText);
                            setMessageText("")
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default ChatsPage;
