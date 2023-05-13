import React, { FC } from "react";
import "../../styles/css/Chats.css";
import Observer from "../common/Observer";
import messageViewed from "../../assets/messageViewed4x.png"


export interface MessageProps {
    key: string
    id: number
    text: string
    createdAt: string
    selfMessage: boolean
    lastMessageObserver: any
    viewed: boolean
    onIntercept: () => void
}

export const Message: FC<MessageProps> = ({ viewed, lastMessageObserver, text, createdAt, selfMessage, onIntercept }) => {
    const className = selfMessage ? "self-message-content-container" : "other-message-content-container";
    const textClassName = selfMessage ? "self-message-text" : "other-message-text";
    const timeClassName = selfMessage ? (viewed ? "self-message-time" : "self-message-time_not_viewed") : "other-message-time";

    return (
        <>
            <Observer onIntercept={onIntercept} />
            <div className={className} ref={lastMessageObserver}>
                <span className={textClassName}>{text}</span>
                <span className={timeClassName}>{createdAt}</span>
                {selfMessage && viewed ? <img className="other-message-viewed" src={messageViewed} /> : <></>}
            </div>
        </>

    );
};
