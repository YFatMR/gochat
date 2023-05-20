import { FC, useContext, useState, useEffect, useRef, MouseEvent } from "react";
import { useNavigate } from 'react-router-dom';
import { Chat } from "../components/chat/Chat";
import { Message, MessageProps } from "../components/chat/Message";
import ContextMenu from "../components/chat/ContextMenu";
import { ChatService } from "../services/ChatService";
import {
    ChatsResponse,
    MessagesResponse,
    ChatInfo, Dialog,
    MessageInfo, MessageResponse,
    NewMessageWSEvent,
    ViewedMessageWSEvent,
    MessageWindowState,
    LinkInfo,
    LinksResponse,
    Link,
} from "../types/Chats"
import "../styles/css/Chats.css";
import Observer from "../components/common/Observer";
import { API_HOST } from "../http/index"
import useWebSocket from 'react-use-websocket';
import autosize from 'autosize';
import classnames from 'classnames';
import { PersonInfoOption } from "../components/chat/PersonInfoOption"
import { MenuOption } from "../components/chat/MenuOption"
import { SettingsItem } from "../components/chat/SettingsItem"
import { BigAvatar, SmallAvatar } from "../components/chat/Avatar"
// Images
import sendMessageActive from "../assets/sendMessageActive.png";
import closeIcon from "../assets/close.png";
import showInstructionIcon from "../assets/showInstruction.png";
import infoIcon from "../assets/info.png";


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
            type: dialog.lastMessage.type,
        },
        lastReadMessage: {
            id: parseInt(dialog.lastReadMessage.messageID.ID),
            text: dialog.lastReadMessage.text,
            createdAt: new Date(dialog.lastReadMessage.createdAt),
            selfMessage: dialog.lastReadMessage.selfMessage,
            viewed: dialog.lastReadMessage.viewed,
            type: dialog.lastReadMessage.type,
        },
    }
}

const linkInfoFromResponse = (link: Link): LinkInfo => {
    return {
        id: parseInt(link.linkID.ID),
        messageID: parseInt(link.messageID.ID),
        link: link.link,
        createdAt: new Date(link.createdAt),
    }
}


const chatsFromResponse = (response: ChatsResponse): ChatInfo[] => {
    return response.dialogs ? response.dialogs.map(dialog => {
        return chatInfoFromResponse(dialog)
    }) : []
}

const linksFromResponse = (response: LinksResponse): LinkInfo[] => {
    return response.links ? response.links.map(link => {
        return linkInfoFromResponse(link)
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
        type: message.type,
    }
}


const messagesInfoFromResponse = (response: MessagesResponse): MessageInfo[] => {
    return response.messages ? response.messages.map(message => {
        return messageInfoFromResponse(message)
    }) : []
}



const ChatsPage: FC = () => {
    const navigate = useNavigate();
    const [chats, setChats] = useState<ChatInfo[]>([]);
    const [messages, setMessages] = useState<MessageInfo[]>([]);
    const [links, setLinks] = useState<LinkInfo[]>([]);

    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const messageTextarea = useRef<HTMLTextAreaElement>(null);

    const instructionNameTextarea = useRef<HTMLTextAreaElement>(null);
    const [instructionNameText, setInstructionNameText] = useState<string>('');

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

    const [selectedMessages, setSelectedMessages] = useState<Map<number, MessageInfo>>(new Map());

    const handleSelectMessage = (message: MessageInfo) => {
        const newSelectedMessages = new Map(selectedMessages);

        if (newSelectedMessages.has(message.id)) {
            newSelectedMessages.delete(message.id)
        } else {
            newSelectedMessages.set(message.id, message)
        }
        setSelectedMessages(newSelectedMessages)
    }

    const handleContextMenu = (event: MouseEvent<HTMLDivElement>, message: MessageInfo) => {
        event.preventDefault();

        if (showMenu) {
            handleCloseMenu();
            return;
        }

        handleSelectMessage(message);

        setMenuPosition({ x: event.clientX, y: event.clientY });

        setShowMenu(true);
    };

    const handleCloseMenu = () => {
        setShowMenu(false);
    };

    useEffect(() => {
        if (selectedMessages.size === 0) {
            setMessageWindowState(MessageWindowState.NORMAL);
        }
    }, [selectedMessages.size])


    useEffect(() => {
        handleCloseMenu();
    }, [activeDialog?.id])


    const menuStyle = {
        position: 'fixed',
        top: `${menuPosition.y}px`,
        left: `${menuPosition.x}px`
    } as React.CSSProperties;

    const menuItems = [
        {
            title: 'Select',
            callback: () => {
                setMessageWindowState(MessageWindowState.SELECTABLE);
            }
        }
    ]

    const [messageText, setMessageText] = useState<string>('');

    const { sendJsonMessage, lastJsonMessage } = useWebSocket(`ws://${API_HOST}/v1/ws?token=${localStorage.getItem('token')}`, {
        onOpen: () => console.log('WebSocket opened'),
        onClose: () => console.log('WebSocket closed'),
        onError: (event) => console.error('WebSocket error:', event),
        onMessage: async (data: any) => {
            const parsedData = JSON.parse(data.data)
            console.log("Websocket event", parsedData)
            if (parsedData.wsType === "new_message") {
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
                        type: newMessageEvent.type,
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
                    type: newMessageEvent.type,
                }
                if (messagesContainerRef.current) {
                    setPrevScrollHeight(messagesContainerRef.current.scrollHeight);
                }
                setMessages([...messages, message])
                console.log('WebSocket data', data)
            } else if (parsedData.wsType === "viewed") {
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

    const fetchLinks = async () => {
        if (!activeDialog) {
            return
        }
        const response = await ChatService.getLinks(activeDialog.id, 30);
        console.log("fetchLinks response", response)
        if (response.status != 200) {
            return
        }
        const newLinks = linksFromResponse(response.data)
        if (newLinks.length === 0) {
            return
        }
        setLinks(newLinks);
    }

    const fetchBottomLinks = async () => {
        if (!activeDialog || links.length === 0) {
            return
        }
        const response = await ChatService.getLinksAfter(activeDialog.id, links[links.length - 1].id, 30);
        console.log("getLinksAfter response", response)
        if (response.status != 200) {
            return
        }
        const newLinks = linksFromResponse(response.data)
        if (newLinks.length === 0) {
            return
        }
        setLinks([...links, ...newLinks]);
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

    const createMessage = async (chatID: number, text: string): Promise<boolean> => {
        if (text === "") {
            return false
        }

        const newText = text.startsWith("::") ? text.substring(2) : text
        const messageType = text.startsWith("::") ? "CODE" : "NORMAL"
        const response = messageType === "CODE" ?
            await ChatService.createMessageWithCode(chatID, "title", newText) :
            await ChatService.createMessage(chatID, newText)
        if (response.status !== 200) {
            return false
        }
        const newMessage = messageInfoFromResponse({
            messageID: {
                ID: response.data.messageID.ID,
            },
            senderID: {
                ID: "0",
            },
            text: newText,
            createdAt: response.data.createdAt,
            selfMessage: true,
            viewed: false,
            type: messageType,
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
                type: newMessage.type,
            }
            return chat
        }).sort((a: ChatInfo, b: ChatInfo) => {
            return b.lastMessage.createdAt.getTime() - a.lastMessage.createdAt.getTime()
        });
        setChats(newChats)
        return true
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

    const onCreateInstruction = async () => {
        const copySelectedMessages = new Map(selectedMessages)
        const title = instructionNameText
        if (title.length <= 0) {
            alert("Заголовок инструкции не должен быть пустым")
            return
        }
        setSelectedMessages(new Map())
        if (copySelectedMessages.size <= 0 || !activeDialog) {
            return
        }
        const instructionText = Array.from(copySelectedMessages.values()).sort((a: MessageInfo, b: MessageInfo) => {
            return a.createdAt.getTime() - b.createdAt.getTime()
        }).map((value: MessageInfo, idx: number) => {
            return (idx + 1).toString() + ". " + value.text
        }).join('\n\n')

        const response = await ChatService.createInstruction(activeDialog.id, title, instructionText)
        if (response.status !== 200) {
            console.error("Can not create instruction", response)
            return
        }
    }

    const smallTitleFromString = (str: string) => {
        if (str.length == 0) {
            return "e"
        }
        const splited = str.split(' ')
        if (splited.length == 0) {
            return "E";
        } else if (splited.length == 1) {
            return splited[0][0];
        }
        return splited[0][0] + splited[1][0];
    }

    return (
        <div className="main-container">
            <div className="left-container">
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
            <div className="central-container">
                {activeDialog &&
                    <div style={
                        {
                            height: '50px', background: 'white', borderLeft: '1px solid #F7F7F7',
                            borderRight: '1px solid #F7F7F7', borderBottom: '1px solid #F7F7F7',
                            display: 'flex', alignItems: 'center', paddingLeft: '20px',
                            justifyContent: 'space-between'
                        }}>
                        <div>
                            <SmallAvatar smallTitle={smallTitleFromString(activeDialog.name)} fullName={activeDialog.name} />
                        </div>
                        <img
                            src={infoIcon}
                            style={{ width: '24px', height: '24px', marginRight: '30px' }}
                            onClick={fetchLinks} />
                    </div>}
                {showMenu && <ContextMenu items={menuItems} menuStyle={menuStyle} />}
                <div ref={messagesContainerRef} className={`messages-container ${showMenu ? "messages-container_disable-scroll" : ""}`}>
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
                                <div className={classnames({ "message-outer-container": message.selfMessage, "message-outer-container_selected": selectedMessages.has(message.id) })} key={message.id.toString()} onContextMenu={(e) => { handleContextMenu(e, message) }}>
                                    <Message
                                        text={message.text}
                                        createdAt={`${message.createdAt.getHours()}:${message.createdAt.getMinutes().toString().padStart(2, '0')}`}
                                        selfMessage={message.selfMessage}
                                        id={message.id}
                                        lastMessageObserver={message.lastMessageObserver}
                                        viewed={message.viewed}
                                        onIntercept={() => { onMessageIntercept(message) }}
                                        messageWindowState={messageWindowState}
                                        handleSelectMessage={() => { handleSelectMessage(message) }}
                                        selected={selectedMessages.has(message.id)}
                                        type={message.type}
                                    />
                                </div>
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
                    {messageWindowState === MessageWindowState.NORMAL ?
                        <>
                            <textarea
                                ref={messageTextarea}
                                className="message-textarea"
                                placeholder="Enter message..."
                                value={messageText}
                                onChange={(event) => { setMessageText(event.target.value) }}
                            />
                            <img
                                className="message-active-image"
                                src={sendMessageActive}
                                onClick={async () => {
                                    if (!activeDialog) {
                                        return
                                    }
                                    console.log("activeDialogID", activeDialog.id)
                                    const created = await createMessage(activeDialog.id, messageText);
                                    if (created) {
                                        setMessageText("")
                                    }
                                }}
                            />
                        </>
                        :
                        <div className={classnames("submit-instruction-container")}>
                            <div className="submit-instruction-inner-top-container">
                                <div className="submit-instruction-messages-count-container" onClick={() => setSelectedMessages(new Map())}>
                                    <div className="close-icon-container">
                                        <img className="close-icon" src={closeIcon} />
                                    </div>
                                    <span className="submit-instruction-messages-text">{selectedMessages.size} message{selectedMessages.size > 1 ? "s" : ""} selected</span>
                                </div>
                                {/* <div className="show-instruction-icon-container ">
                                    <img className="show-instruction-icon" src={showInstructionIcon} />
                                </div> */}
                            </div >
                            <div className="submit-instruction-inner-bottom-container">
                                <textarea
                                    ref={instructionNameTextarea}
                                    value={instructionNameText}
                                    className="submit-instruction-name-textarea"
                                    placeholder="Enter the name..."
                                    onChange={(event) => { setInstructionNameText(event.target.value) }}
                                />
                                <button
                                    className="submit-instruction-button"
                                    onClick={() => { onCreateInstruction() }}
                                >Ok</button>
                            </div>
                        </div>
                    }

                </div>
            </div>
            <div className="right-container">
                <div style={{ display: "flex", flexDirection: "column", marginTop: '16px', gap: '12px' }}>
                    {/* personal info: name & surname */}
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <BigAvatar smallTitle={smallTitleFromString(activeDialog?.name || "")} fullName={activeDialog?.name || ""} />
                        <img src={closeIcon} style={{ width: '14px', height: '14px' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: "32px" }}>
                            {activeDialog?.name}
                        </span>
                        <span style={{ fontSize: "14px", color: "#3F3F46" }}>
                            backend developer
                        </span>
                    </div>
                </div>
                <div style={
                    {
                        display: "flex", flexDirection: "column",
                        background: '#FAFAFA',
                        padding: '16px',
                        borderRadius: '12px',
                        gap: '12px',
                    }
                }>
                    {/* personal info: mail, username, github */}
                    <PersonInfoOption title="email" text="test@mail.ru" />
                    <PersonInfoOption title="username" text="testuser" />
                    <PersonInfoOption title="gihub" text="yarkil" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflow: 'auto', paddingBottom: '16px' }}>
                    {/* links, instructions options */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <MenuOption title="Links" active={true} onClick={() => { }} />
                        <MenuOption title="Instructions" active={false} onClick={() => { }} />
                    </div>
                    <div className="settings-item-container">
                        {/* links/instructions list */}
                        {links.map((link) => (
                            <SettingsItem
                                id={link.id}
                                text={link.link}
                            />
                        ))}
                        <Observer onIntercept={() => {
                            fetchBottomLinks()
                        }} />

                        {/*
                        <SettingsItem id={1} text={"https://www.apple.com/"} />
                        <SettingsItem id={2} text={"https://www.apple.com/"} />
                        <SettingsItem id={3} text={"https://www.apple.com/"} />
                        <SettingsItem id={14} text={"https://www.apple.com/"} />
                        <SettingsItem id={15} text={"https://www.apple.com/"} />
                        <SettingsItem id={123} text={"https://www.apple.com/"} />
                        <SettingsItem id={15} text={"https://www.apple.com/"} />
                        <SettingsItem id={16} text={"https://www.apple.com/"} />
                        <SettingsItem id={17} text={"https://www.apple.com/"} />
                        <SettingsItem id={19} text={"https://www.apple.com/"} /> */}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ChatsPage;
