import React, { FC } from "react";
import "../../styles/css/Chats.css";


export interface MessageProps {
    key: string,
    id: number,
    senderID: number,
    text: string;
    createdAt: string,
    selfMessage: boolean,
    observerTopRef: any,
}


export const Message: FC<MessageProps> = ({ text, createdAt, selfMessage, observerTopRef }) => {
    const className = selfMessage ? "self-message-content-container" : "other-message-content-container";
    const textClassName = selfMessage ? "self-message-text" : "other-message-text";
    const timeClassName = selfMessage ? "self-message-time" : "other-message-time";
    return (
        <div className={className} ref={observerTopRef}>
            <span className={textClassName}>{text}</span>
            <span className={timeClassName}>{createdAt}</span>
        </div>
    );
};
