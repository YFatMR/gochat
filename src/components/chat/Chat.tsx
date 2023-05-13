import React, { FC } from "react";
import "../../styles/css/Chats.css";

export type OnClickType = () => Promise<void>

export interface ChatProps {
    key: string,
    id: number,
    name: string,
    lastMessage: {
        id: number
        text: string
        createdAt: string
    }
    unreadMessagesCount: number,
    onClick: OnClickType,
    isActive: boolean,
}


export const Chat: FC<ChatProps> = ({ id, name, lastMessage, unreadMessagesCount, onClick, isActive }) => {
    const onChatClick = () => {
        onClick();
    }
    return (
        <button className={isActive ? 'chat_active chat' : 'chat'} onClick={onChatClick} name={id.toString()}>
            {/* <img src="path/to/image.png" alt="Изображение"></img> */}
            <span id={id.toString()}></span>
            <div className="container">
                <div className="title">{name}</div>
                <div className="text">{lastMessage.text}</div>
            </div>
            <div className="chat-message-info-container">
                <span className="time">{lastMessage.createdAt}</span>
                {unreadMessagesCount > 0 ? <span className="unread-messages-count">{unreadMessagesCount}</span> : <></>}

            </div>

        </button>
    );
};
