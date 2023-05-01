import React, { FC } from "react";
import "../../styles/css/Chats.css";

export type OnClickType = Promise<() => Promise<void>>

export interface ChatProps {
    key: string,
    id: number,
    name: string,
    messageID: number;
    messageText: string;
    messageTimestamp: string,
    unreadMessagesCount: number,
    messagesCount: number,
    onClick: OnClickType,
    observerBottomRef: any,
    active: boolean,
}


export const Chat: FC<ChatProps> = ({ id, observerBottomRef, name, messageText, messageTimestamp, unreadMessagesCount, onClick }) => {
    return (
        <button className="chat" onClick={async () => await (await onClick)()} ref={observerBottomRef} id={id.toString()}>
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
