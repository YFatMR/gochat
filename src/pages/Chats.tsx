import { FC, useContext, useState, useEffect, useRef, MouseEvent } from "react";
import { useNavigate } from 'react-router-dom';
import { Chat } from "../components/chat/Chat";
import { Message, MessageProps } from "../components/chat/Message";
import ContextMenu from "../components/chat/ContextMenu";
import { ChatService } from "../services/ChatService";
import { ChatsResponse, MessagesResponse, ChatInfo, Dialog, MessageInfo, MessageResponse, NewMessageEvent } from "../types/Chats"
import "../styles/css/Chats.css";
import Observer from "../components/common/Observer";
import sendMessageActive from "../assets/sendMessageActive.png";
import { API_HOST } from "../http/index"
import useWebSocket from 'react-use-websocket';
import autosize from 'autosize';

const chatInfoFromResponse = (dialog: Dialog): ChatInfo => {
    return {
        id: parseInt(dialog.dialogID.ID) || 0,
        messageID: parseInt(dialog.lastMessage.messageID.ID) || 0,
        name: dialog.name,
        messageText: dialog.lastMessage.text,
        messageTimestamp: new Date(dialog.lastMessage.createdAt),
        unreadMessagesCount: parseInt(dialog.unreadMessagesCount) || 0,
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

    const [lastReadMessage, setLastReadMessage] = useState<MessageInfo | null>(null);

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
            const newMessageEvent = JSON.parse(data.data) as NewMessageEvent
            console.log(newMessageEvent)

            // update dialog list order
            var newChats = [...chats]
            const existChatIdx = newChats.findIndex(chat => chat.id == newMessageEvent.dialogID.ID)
            if (existChatIdx === -1) {
                // load dialog
                const newDialog = await ChatService.getDialogByID(newMessageEvent.dialogID.ID)
                newChats = [chatInfoFromResponse(newDialog.data), ...newChats]
            } else {
                // set new params
                newChats[existChatIdx].messageText = newMessageEvent.text
                newChats[existChatIdx].messageTimestamp = new Date(newMessageEvent.createdAt)
                newChats[existChatIdx].unreadMessagesCount += 1
            }
            newChats.sort((a: ChatInfo, b: ChatInfo) => {
                return b.messageTimestamp.getTime() - a.messageTimestamp.getTime()
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
                lastMessageObserver: null,
            }
            if (messagesContainerRef.current) {
                setPrevScrollHeight(messagesContainerRef.current.scrollHeight);
            }
            setMessages([...messages, message])
            console.log('WebSocket data', data)
        },
        shouldReconnect: (closeEvent) => true,
        reconnectAttempts: 10,
        reconnectInterval: 3000,
    });

    const dialogMessagesPerRequest = 40;
    const chatsCountPerRequest = 30

    useEffect(() => {
        if (messages.length < dialogMessagesPerRequest) {
            // first load
            messagesBottomRef.current?.scrollIntoView();
        };

        if (!messagesContainerRef.current) {
            return
        }
        if (prevScrollHeight !== 0) {
            const delta = messagesContainerRef.current.scrollHeight - prevScrollHeight;
            messagesContainerRef.current.scrollTop += delta;
            setPrevScrollHeight(messagesContainerRef.current.scrollHeight);
        } else {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    }, [messages])


    const handleDialogClick = async (chat: ChatInfo, topMessageID: number): Promise<void> => {
        const newMessagesResponse = await ChatService.getMessagesBeforeIncl(chat.id, topMessageID, dialogMessagesPerRequest);
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
        setMessages(newMessages)
        setLastReadMessage(newMessages[newMessages.length - 1])
        if (messages.length < dialogMessagesPerRequest) {
            // first load
            messagesBottomRef.current?.scrollIntoView();
        };
    }

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
        const newMessages = messagesInfoFromResponse(response.data)
        if (newMessages.length === 0) {
            return []
        }
        if (messagesContainerRef.current) {
            setPrevScrollHeight(messagesContainerRef.current.scrollHeight)
        }
        return newMessages
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
        })
        setMessages([...messages, newMessage]);

        const newChats = [...chats].map((chat) => {
            if (chat.id !== activeDialog?.id) {
                return chat
            }
            chat.messageID = newMessage.id
            chat.messageText = newMessage.text
            chat.messageTimestamp = newMessage.createdAt
            return chat
        }).sort((a: ChatInfo, b: ChatInfo) => {
            return b.messageTimestamp.getTime() - a.messageTimestamp.getTime()
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
        if (!activeDialog || !lastReadMessage) {
            return
        }
        if (message.createdAt < lastReadMessage.createdAt) {
            return
        }
        const response = await ChatService.readAllMessagesBeforeIncl(activeDialog.id, message.id)
        if (response.status !== 200) {
            return
        }
        if (message.createdAt > lastReadMessage.createdAt) {
            setLastReadMessage(message)
        }
    }

    return (
        <div className="main-container">
            <div className="chats-container">
                {chats.map((chat) => (
                    <Chat
                        key={chat.id.toString()}
                        id={chat.id}
                        messageID={chat.messageID}
                        name={chat.name}
                        messageText={chat.messageText}
                        unreadMessagesCount={chat.unreadMessagesCount}
                        messageTimestamp={`${chat.messageTimestamp.getHours()}:${chat.messageTimestamp.getMinutes().toString().padStart(2, '0')}`}
                        onClick={() => { return handleDialogClick(chat, chat.messageID) }}
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
                                if (!activeDialog) {
                                    return
                                }
                                const newMessages = await fetchTopDialogMessages(activeDialog.id, messages[0].id)
                                setMessages([...newMessages, ...messages]);
                            }} />
                            {messages.map((message) => (
                                <Message
                                    key={message.id.toString()}
                                    text={message.text}
                                    createdAt={`${message.createdAt.getHours()}:${message.createdAt.getMinutes().toString().padStart(2, '0')}`}
                                    selfMessage={message.selfMessage}
                                    id={message.id}
                                    lastMessageObserver={message.lastMessageObserver}
                                    isRead={false}
                                    onIntercept={() => { onMessageIntercept(message) }}
                                />
                            ))}
                            <div ref={messagesBottomRef}></div>
                            <Observer onIntercept={() => {
                                console.log('on intersect bottom messages');
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
