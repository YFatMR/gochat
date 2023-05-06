import { FC, useContext, useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { Chat, ChatProps } from "../components/chat/Chat";
import { Message, MessageProps } from "../components/chat/Message";
import { ChatService } from "../services/ChatService";
import { ChatsResponse, MessagesResponse, ChatInfo } from "../types/Chats"
import "../styles/css/Chats.css";
import Observer from "../components/common/Observer";



const chatsFromResponse = (response: ChatsResponse): ChatInfo[] => {
    return response.dialogs ? response.dialogs.map(dialog => {
        const date = new Date(dialog.lastMessage.createdAt);
        const messagesCount = parseInt(dialog.messagesCount) || 0
        // + 1 to include last message
        // const messageID = parseInt(dialog.lastMessage.messageID.ID) + 1
        return {
            id: parseInt(dialog.dialogID.ID) || 0,
            messageID: parseInt(dialog.lastMessage.messageID.ID) || 0,
            name: dialog.name,
            messageText: dialog.lastMessage.text,
            messageTimestamp: `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`,
            unreadMessagesCount: parseInt(dialog.unreadMessagesCount) || 0,
            messagesCount: messagesCount,
            // onClick: () => { return onClickHandler(dialog.dialogID.ID, messageID) },
            // isActive: false,
        }
    }) : []
}

const messagesFromResponse = (response: MessagesResponse): MessageProps[] => {
    return response.messages ? response.messages.map(message => {
        const date = new Date(message.createdAt);
        return {
            key: message.messageID.ID,
            id: parseInt(message.messageID.ID),
            senderID: parseInt(message.senderID.ID),
            text: message.text,
            createdAt: `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`,
            selfMessage: message.selfMessage,
        }
    }) : []
}


const ChatsPage: FC = () => {
    const navigate = useNavigate();
    const [chats, setChats] = useState<ChatInfo[]>([]);
    const [messages, setMessages] = useState<MessageProps[]>([]);
    const messagesRef = useRef<HTMLDivElement>(null);
    const [prevScrollHeight, setPrevScrollHeight] = useState(0);

    const [activeDialogID, setActiveDialogID] = useState<number | null>(null);
    const messagesBottomRef = useRef<HTMLDivElement>(null);

    const dialogMessagesPerRequest = 40;
    const chatsCountPerRequest = 30

    useEffect(() => {
        if (messages.length < dialogMessagesPerRequest) {
            // first load
            messagesBottomRef.current?.scrollIntoView();
        };

        if (messagesRef.current) {
            if (prevScrollHeight !== 0) {
                const delta = messagesRef.current.scrollHeight - prevScrollHeight;
                messagesRef.current.scrollTop += delta;
                setPrevScrollHeight(messagesRef.current.scrollHeight);
            } else {
                messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
            }
        }
    }, [messages])


    const handleDialogClick = async (chatID: number, topMessageID: number): Promise<void> => {
        const newMessagesResponse = await ChatService.getMessagesBefore(chatID, topMessageID, dialogMessagesPerRequest);
        console.log("newMessagesResponse", newMessagesResponse)
        if (newMessagesResponse.status != 200) {
            return
        }
        const newMessages = messagesFromResponse(newMessagesResponse.data)
        setActiveDialogID(chatID)
        if (newMessages.length === 0) {
            return
        }
        setMessages(newMessages)

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

    const fetchTopDialogMessages = async (chatID: number, topMessageID: number) => {
        const response = await ChatService.getMessagesBefore(chatID, topMessageID, dialogMessagesPerRequest);
        console.log("fetchTopDialogMessages response", response)
        if (response.status != 200) {
            navigate("")
            return
        }
        const newMessages = messagesFromResponse(response.data)
        if (newMessages.length === 0) {
            return
        }
        if (messages.length === 0) {
            if (messagesRef.current) {
                setPrevScrollHeight(messagesRef.current.scrollHeight)
            }

            setMessages(newMessages)
            return
        }

        if (messagesRef.current) {
            setPrevScrollHeight(messagesRef.current.scrollHeight)
        }

        setMessages([...newMessages, ...messages]);
    }

    // init list of dialogs
    useEffect(() => {
        fetchBottomChats()
    }, []);

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
                        messageTimestamp={chat.messageTimestamp}
                        messagesCount={chat.messagesCount}
                        onClick={() => { return handleDialogClick(chat.id, chat.messageID) }}
                        isActive={Number(activeDialogID) === chat.id}
                    />
                ))}
                <Observer onIntercept={() => {
                    fetchBottomChats()
                }} />
            </div>
            <div className="right-container">
                <div ref={messagesRef} className="messages-container">
                    {messages.length ?
                        <>
                            <Observer onIntercept={() => {
                                if (!activeDialogID) {
                                    return
                                }
                                fetchTopDialogMessages(activeDialogID, messages[0].id)
                            }} />
                            {messages.map((message) => (
                                <Message
                                    key={message.key}
                                    senderID={message.senderID}
                                    text={message.text}
                                    createdAt={message.createdAt}
                                    selfMessage={message.selfMessage}
                                    id={message.id}
                                />
                            ))}
                            <div ref={messagesBottomRef}></div>
                            <Observer onIntercept={() => {
                                console.log('on intersect bottom messages');
                            }} />
                        </> : <div> There is no messages... </div>}
                </div>
                <textarea className="message-textarea" placeholder="Введите текст..."></textarea>
            </div>
        </div>
    );
};

export default ChatsPage;
