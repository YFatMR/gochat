import React, { FC } from "react";
import "../../styles/css/Chats.css";

type OnClickType = Promise<() => Promise<void>>

export interface ChatProps {
    key: string,
    name: string,
    messageText: string;
    messageTimestamp: string,
    unreadMessagesCount: number,
    messagesCount: number,
    onClick: OnClickType,
}


export const Chat: FC<ChatProps> = ({ key, name, messageText, messageTimestamp, unreadMessagesCount, messagesCount, onClick }) => {
    return (
        <button className="chat" onClick={async () => await (await onClick)()}>
            {/* <img src="path/to/image.png" alt="Изображение"></img> */}
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
