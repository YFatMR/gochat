import React, { FC } from "react";
import "../../styles/css/Chats.css";


export interface MessageProps {
    key: string,
    senderID: string,
    text: string;
    createdAt: string,
    selfMessage: boolean,
}


export const Message: FC<MessageProps> = ({ text, createdAt, selfMessage }) => {
    const className = selfMessage ? "self-message-content-container" : "other-message-content-container";
    const textClassName = selfMessage ? "self-message-text" : "other-message-text";
    const timeClassName = selfMessage ? "self-message-time" : "other-message-time";
    return (
        <div className={className}>
            <span className={textClassName}>{text}</span>
            <span className={timeClassName}>{createdAt}</span>
        </div>
    );
};
