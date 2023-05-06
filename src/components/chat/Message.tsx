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
    observerBottomRef: any,
}


export const Message: FC<MessageProps> = ({ text, createdAt, selfMessage, observerTopRef, observerBottomRef }) => {
    const className = selfMessage ? "self-message-content-container" : "other-message-content-container";
    const textClassName = selfMessage ? "self-message-text" : "other-message-text";
    const timeClassName = selfMessage ? "self-message-time" : "other-message-time";
    return (
        <div className={className} ref={observerBottomRef}>
            <span className={textClassName} ref={observerTopRef}>{text}</span>
            <span className={timeClassName}>{createdAt}</span>
        </div>
    );
};
