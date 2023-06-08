import { FC, useContext, useState, useEffect, useRef, MouseEvent } from "react";

import { ChatService } from "../../services/ChatService";

import { MessageWindowState } from "../../types/Chats";

import {
    ChatInfo,
    MessageInfo,
    MessagesResponse,
    MessageResponse,
} from "../../types/Chats"

import Observer from "../common/Observer";
import { Message } from "./Message"
import ContextMenu from "./ContextMenu"
import classnames from 'classnames';
import autosize from 'autosize';

// Images
import closeIcon from "../../assets/close.png";
import sendMessageActive from "../../assets/sendMessageActive.png";

// CSS
import "../../styles/css/Chats.css";

interface Props {
    activeDialog: ChatInfo | null
    setActiveDialogUnreadMessagesCount: (count: number) => void

    messages: MessageInfo[]
    setMessages: React.Dispatch<React.SetStateAction<MessageInfo[]>>

    messagesContainerRef: React.RefObject<HTMLDivElement>

    prevScrollHeight: number
    setPrevScrollHeight: React.Dispatch<React.SetStateAction<number>>

    isActiveBardDialog: boolean
}

const messageInfoFromResponse = (message: MessageResponse): MessageInfo => {
    return {
        id: parseInt(message.messageID.ID),
        text: message.text,
        createdAt: new Date(message.createdAt),
        selfMessage: message.selfMessage,
        viewed: message.viewed,
        lastMessageObserver: null,
        type: parseInt(message.type),
    }
}

const messagesInfoFromResponse = (response: MessagesResponse): MessageInfo[] => {
    return response.messages ? response.messages.map(message => {
        return messageInfoFromResponse(message)
    }) : []
}

export const MessagesList: React.FC<Props> = ({ activeDialog, messages, setMessages, messagesContainerRef,
    prevScrollHeight, setPrevScrollHeight, setActiveDialogUnreadMessagesCount, isActiveBardDialog }) => {
    const lastViewedMessageRef = useRef<HTMLDivElement>(null);
    const messagesBottomRef = useRef<HTMLDivElement>(null);
    const [fetchingDialogs, setFetchingDialogs] = useState<boolean>(false);
    const [messageWindowState, setMessageWindowState] = useState<MessageWindowState>(MessageWindowState.NORMAL);

    const [showMenu, setShowMenu] = useState<Boolean>(false);
    const [menuPosition, setMenuPosition] = useState<Record<string, number>>({ x: 0, y: 0 });
    const [selectedMessages, setSelectedMessages] = useState<Map<number, MessageInfo>>(new Map());

    const [firstMessagesLoad, setFirstMessagesLoad] = useState<boolean>(false);

    const instructionNameTextarea = useRef<HTMLTextAreaElement>(null);
    const [instructionNameText, setInstructionNameText] = useState<string>('');

    const [messageText, setMessageText] = useState<string>('');
    const messageTextarea = useRef<HTMLTextAreaElement>(null);

    const dialogMessagesPerRequest = 30;

    const [bardMessages, setBardMessages] = useState<MessageInfo[]>([])

    const onActiveDialogChange = async () => {
        if (!activeDialog) {
            return
        }
        const newMessagesResponse = await ChatService.getMessagesBeforeAndInclude(activeDialog.id, activeDialog.lastReadMessage.id, dialogMessagesPerRequest);
        console.log("newMessagesResponse", newMessagesResponse)
        if (newMessagesResponse.status != 200) {
            return
        }
        const newMessages = messagesInfoFromResponse(newMessagesResponse.data)
        if (newMessages.length === 0) {
            return
        }
        newMessages[newMessages.length - 1].lastMessageObserver = lastViewedMessageRef
        setMessages(newMessages)
        setFirstMessagesLoad(true)
    }

    const fetchTopDialogMessages = async (chatID: number, topMessageID: number): Promise<MessageInfo[]> => {
        const response = await ChatService.getMessagesBefore(chatID, topMessageID, dialogMessagesPerRequest);
        if (response.status != 200) {
            console.error(response)
            return []
        }
        return messagesInfoFromResponse(response.data)
    }

    const fetchBottomDialogMessages = async (chatID: number, bottomMessageID: number): Promise<MessageInfo[]> => {
        const response = await ChatService.getMessagesAfter(chatID, bottomMessageID, dialogMessagesPerRequest);
        if (response.status != 200) {
            console.error(response)
            return []
        }
        return messagesInfoFromResponse(response.data)
    }

    const onMessageIntercept = async (message: MessageInfo) => {
        if (!messagesContainerRef.current || !activeDialog || message.selfMessage || message.viewed) {
            return
        }
        // чужое сообщение которое еще не просмотрено
        const readMessageResponse = await ChatService.readMessage(activeDialog.id, message.id)
        if (readMessageResponse.status !== 200) {
            console.error(readMessageResponse)
            return
        }

        const unreadMessagesResponse = await ChatService.getDialogUnreadMessagesCount(activeDialog.id)
        if (unreadMessagesResponse.status !== 200) {
            console.error(unreadMessagesResponse)
            return
        } else {
            console.log("unreadMessagesResponse", unreadMessagesResponse)
        }
        setActiveDialogUnreadMessagesCount(unreadMessagesResponse.data.count || 0)
        setMessages(messages.map((inMessage) => {
            if (inMessage.id != message.id) {
                return inMessage
            }
            const updated = inMessage
            updated.viewed = true
            return updated
        }))
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

    const createMessage = async (chatID: number, text: string): Promise<void> => {
        if (text === "") {
            return
        }

        const newText = text.startsWith("::") ? text.substring(2) : text
        const messageType = text.startsWith("::") ? 2 : 1
        const response = messageType === 2 ?
            await ChatService.createMessageWithCode(chatID, "title", newText) :
            await ChatService.createMessage(chatID, newText)
        if (response.status !== 200) {
            console.error(response)
            return
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
            type: messageType.toString(),
        })
        console.log("NEW MSG", newMessage)
        setMessages([...messages, newMessage]);
        setMessageText("")
    }

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

    // menu
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


    useEffect(() => { onActiveDialogChange() }, [activeDialog])
    useEffect(() => {
        if (!messagesContainerRef.current) {
            return
        }
        messagesContainerRef.current.scrollTop = prevScrollHeight
    }, [messages])
    useEffect(() => {
        console.log("EFFECT", messagesBottomRef.current, firstMessagesLoad)
        if (!messagesBottomRef.current || !firstMessagesLoad) {
            return
        }
        messagesBottomRef.current.scrollIntoView();
        setFirstMessagesLoad(false)
    }, [firstMessagesLoad])

    // menu
    useEffect(() => {
        if (selectedMessages.size === 0) {
            setMessageWindowState(MessageWindowState.NORMAL);
        }
    }, [selectedMessages.size])
    useEffect(() => {
        handleCloseMenu();
    }, [activeDialog?.id])


    useEffect(() => {
        // text area
        if (messageTextarea.current) {
            autosize(messageTextarea.current);
        }

        // to select messages
        const handleDocumentClick = () => {
            handleCloseMenu()
        };
        window.addEventListener('click', handleDocumentClick);
        return () => {
            window.removeEventListener('click', handleDocumentClick);
        };
    }, []);

    if (isActiveBardDialog) {
        return <>
            <div ref={messagesContainerRef} className={`messages-container ${showMenu ? "messages-container_disable-scroll" : ""}`}>
                {bardMessages.length ?
                    <>
                        {bardMessages.map((message) => (
                            <div className={classnames({ "message-outer-container": message.selfMessage, "message-outer-container_selected": selectedMessages.has(message.id) })} key={message.id.toString()} onContextMenu={(e) => { handleContextMenu(e, message) }}>
                                <Message
                                    text={message.text}
                                    createdAt={`${message.createdAt.getHours()}:${message.createdAt.getMinutes().toString().padStart(2, '0')}`}
                                    selfMessage={message.selfMessage}
                                    id={message.id}
                                    lastMessageObserver={null}
                                    viewed={false}
                                    onIntercept={() => { }}
                                    messageWindowState={MessageWindowState.NORMAL}
                                    handleSelectMessage={() => { }}
                                    selected={false}
                                    type={1}
                                />
                            </div>
                        ))}
                    </> : <div></div>}
            </div>
            <div className="current-message-container">
                <textarea
                    ref={messageTextarea}
                    className="message-textarea"
                    placeholder="Введите сообщение..."
                    value={messageText}
                    onChange={(event) => { setMessageText(event.target.value) }}
                />
                <img
                    className="message-active-image"
                    src={sendMessageActive}
                    onClick={async () => {
                        if (!isActiveBardDialog) {
                            return
                        }
                        const inBardTextMessage = messageText
                        const newMessage = {
                            id: bardMessages.length,
                            text: inBardTextMessage,
                            createdAt: new Date(),
                            selfMessage: true,
                            viewed: false,
                            lastMessageObserver: null,
                            type: 1,
                        }

                        setMessageText("")

                        const response = await ChatService.getBardAnswer(inBardTextMessage)
                        if (response.status !== 200) {
                            console.error(response)
                            return
                        }

                        const newBardMessage = {
                            id: bardMessages.length,
                            text: response.data.text,
                            createdAt: new Date(),
                            selfMessage: false,
                            viewed: false,
                            lastMessageObserver: null,
                            type: 1,
                        }
                        setBardMessages([...bardMessages, newMessage, newBardMessage])
                    }}
                />
            </div>
        </>
    }

    return (
        <>
            {showMenu && <ContextMenu items={menuItems} menuStyle={menuStyle} />}
            <div ref={messagesContainerRef} className={`messages-container ${showMenu ? "messages-container_disable-scroll" : ""}`}>
                {messages.length ?
                    <>
                        <Observer height='10px' onIntercept={async () => {
                            if (!activeDialog || fetchingDialogs || (messages.length > 0 && messages[0].id === 1)) {
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
                        <Observer height='10px' onIntercept={async () => {
                            if (!activeDialog || fetchingDialogs || (messages.length > 0 && messages[messages.length - 1].id === activeDialog.lastMessage.id)) {
                                return
                            }
                            setFetchingDialogs(true)
                            const newMessages = await fetchBottomDialogMessages(activeDialog.id, messages[messages.length - 1].id)
                            console.log('on intersect bottom messages');

                            setPrevScrollHeight(messagesContainerRef.current?.scrollTop || 0)
                            setMessages([...messages, ...newMessages]);

                            setFetchingDialogs(false)
                        }} />
                    </> : <div></div>}

            </div>
            <div className="current-message-container">
                {messageWindowState === MessageWindowState.NORMAL ?
                    <>
                        <textarea
                            ref={messageTextarea}
                            className="message-textarea"
                            placeholder="Введите сообщение..."
                            value={messageText}
                            onChange={(event) => { setMessageText(event.target.value) }}
                        />
                        <img
                            className="message-active-image"
                            src={sendMessageActive}
                            onClick={() => {
                                if (!activeDialog) {
                                    return
                                }
                                createMessage(activeDialog.id, messageText);
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
                                placeholder="Введите имя..."
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
        </>
    )
}
