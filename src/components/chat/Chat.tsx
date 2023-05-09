import React, { FC } from "react";
import "../../styles/css/Chats.css";

export type OnClickType = () => Promise<void>

export interface ChatProps {
    key: string,
    id: number,
    name: string,
    messageID: number;
    messageText: string;
    messageTimestamp: string,
    unreadMessagesCount: number,
    onClick: OnClickType,
    isActive: boolean,
}


export const Chat: FC<ChatProps> = ({ id, name, messageText, messageTimestamp, unreadMessagesCount, onClick, isActive }) => {
    const onChatClick = () => {
        onClick();
    }
    return (
        <button className={isActive ? 'chat_active chat' : 'chat'} onClick={onChatClick} name={id.toString()}>
            {/* <img src="path/to/image.png" alt="Изображение"></img> */}
            <span id={id.toString()}></span>
            <div className="container">
                <div className="title">{name}</div>
                <div className="text">{messageText}</div>
            </div>
            <div className="chat-message-info-container">
                <span className="time">{messageTimestamp}</span>
                <span className="unread-messages-count">{unreadMessagesCount}</span>
            </div>

        </button>
    );
};
