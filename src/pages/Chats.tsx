import { FC, useContext, useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { Chat, ChatProps } from "../components/chat/Chat";
import { Message, MessageProps } from "../components/chat/Message";
import { ChatService } from "../services/ChatService";
import { ChatsResponse, MessagesResponse } from "../types/Chats"
import "../styles/css/Chats.css";
import { off } from "process";

const ChatsPage: FC = () => {
    const navigate = useNavigate();
    const [chats, setChats] = useState<ChatProps[]>([]);
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState<MessageProps[]>([]);

    const DIALOG_HEIGHT = 80
    const dialogMessagesPerRequest = 50;
    const chatsCountPerRequest = 30

    const calcOffset = (overallMessages: number, messagesAlreadyLoaded: number, limit: number): number => {
        const res = (overallMessages - messagesAlreadyLoaded - limit)
        return res <= 0 ? 0 : res
    }

    const messagesFromResponse = (response: MessagesResponse): MessageProps[] => {
        return response.messages ? response.messages.map(message => {
            const date = new Date(message.createdAt);
            return {
                key: message.messageID.ID,
                senderID: message.senderID.ID,
                text: message.text,
                createdAt: `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`,
                selfMessage: message.selfMessage,
            }
        }) : []
    }

    const handleDialogClick = async (chatID: string, overallMessages: number): Promise<() => Promise<void>> => {
        return async () => {
            const diff = overallMessages - dialogMessagesPerRequest
            const offset = diff > 0 ? diff : 0
            const newMessagesResponse = await ChatService.getMessages(chatID, dialogMessagesPerRequest, offset);
            console.log(newMessagesResponse)
            console.log("dialog click")
            if (newMessagesResponse.status != 200) {
                return
            }
            setMessages(messagesFromResponse(newMessagesResponse.data))
        }
    }

    const chatsFromResponse = (response: ChatsResponse): ChatProps[] => {
        return response.dialogs ? response.dialogs.map(dialog => {
            const date = new Date(dialog.lastMessage.createdAt);
            const messagesCount = parseInt(dialog.messagesCount) || 0
            return {
                key: dialog.dialogID.ID,
                name: dialog.name,
                messageText: dialog.lastMessage.text,
                messageTimestamp: `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`,
                unreadMessagesCount: parseInt(dialog.unreadMessagesCount) || 0,
                messagesCount: messagesCount,
                onClick: handleDialogClick(dialog.dialogID.ID, messagesCount),
            }
        }) : []
    }

    const loadInitialChats = async () => {
        if (loading) return;
        setLoading(true);
        const initChatsResponse = await ChatService.getDialogs(chatsCountPerRequest, chats.length)

        if (initChatsResponse.status != 200) {
            setLoading(false);
            navigate("")
            return
        }
        console.log("initChats response", initChatsResponse)
        setChats(chatsFromResponse(initChatsResponse.data))
        setLoading(false);
    }

    const loadMoreChats = async () => {
        if (loading) return;
        setLoading(true);
        const load = async () => {
            const newChatsResponse = await ChatService.getDialogs(chatsCountPerRequest, chats.length);

            console.log("loadMoreChats response", newChatsResponse)
            const newChats = chatsFromResponse(newChatsResponse.data)
            if (newChats.length === 0) {
                return
            }
            setChats([...chats, ...newChats]);
        }
        await load()
        setLoading(false);
    }

    const loadMoreMessages = async () => {
        if (loading) return;
        setLoading(true);
        const load = async () => {
            const newChatsResponse = await ChatService.getDialogs(chatsCountPerRequest, chats.length);

            console.log("loadMoreChats response", newChatsResponse)
            const newChats = chatsFromResponse(newChatsResponse.data)
            if (newChats.length === 0) {
                return
            }
            setChats([...chats, ...newChats]);
        }
        await load()
        setLoading(false);
    }

    useEffect(() => {
        loadInitialChats();
    }, []);

    const handleScroll = (event: any) => {
        const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
        if (scrollHeight - (scrollTop + clientHeight) < 10 * DIALOG_HEIGHT) {
            loadMoreChats();
        }
    };

    return (
        <div className="main-container">
            <div className="chats-container" onScroll={handleScroll}>
                {chats.map((chat) => (
                    <Chat
                        key={chat.key}
                        name={chat.name}
                        messageText={chat.messageText}
                        unreadMessagesCount={chat.unreadMessagesCount}
                        messageTimestamp={chat.messageTimestamp}
                        messagesCount={chat.messagesCount}
                        onClick={chat.onClick}
                    />
                ))}
            </div>
            <div className="messages-container">
                {messages.map((message) => (
                    <Message
                        key={message.key}
                        senderID={message.senderID}
                        text={message.text}
                        createdAt={message.createdAt}
                        selfMessage={message.selfMessage}
                    />
                ))}
            </div>
        </div>
    );
};

export default ChatsPage;
