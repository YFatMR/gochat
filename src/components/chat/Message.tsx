import React, { FC } from "react";
import "../../styles/css/Chats.css";
import Observer from "../common/Observer";


export interface MessageProps {
    key: string
    id: number
    text: string
    createdAt: string
    selfMessage: boolean
    lastMessageObserver: any
    isRead: boolean
    onIntercept: () => void
}

export const Message: FC<MessageProps> = ({ lastMessageObserver, text, createdAt, selfMessage, onIntercept }) => {
    const className = selfMessage ? "self-message-content-container" : "other-message-content-container";
    const textClassName = selfMessage ? "self-message-text" : "other-message-text";
    const timeClassName = selfMessage ? "self-message-time" : "other-message-time";

    return (
        <>
            <div className={className} ref={lastMessageObserver}>
                <span className={textClassName}>{text}</span>
                <span className={timeClassName}>{createdAt}</span>

            </div>
            <Observer onIntercept={onIntercept} />
        </>

    );
};
