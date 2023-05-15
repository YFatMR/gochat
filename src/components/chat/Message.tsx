import React, { FC } from "react";
import "../../styles/css/Chats.css";
import Observer from "../common/Observer";
import { MessageWindowState } from "../../types/Chats";
import classnames from 'classnames';
import { CodeBlock } from "./CodeBlock";

// Images
import messageViewed from "../../assets/messageViewed4x.png"
import disabledCheckboxImage from "../../assets/disabledCheckbox.png"
import activeCheckboxImage from "../../assets/activeCheckbox.png"


export interface MessageProps {
    id: number
    text: string
    createdAt: string
    selfMessage: boolean
    lastMessageObserver: any
    viewed: boolean
    onIntercept: () => void
    messageWindowState: MessageWindowState
    handleSelectMessage: () => void
    selected: boolean
    type: string // "NORMAL", "CODE"
}

export const Message: FC<MessageProps> = ({ type, viewed, lastMessageObserver, text, createdAt, selfMessage, onIntercept, messageWindowState, handleSelectMessage, selected }) => {
    const className = (selfMessage ? "message-container_self" : "message-container_other") + (type === "NORMAL" ? "" : "-code");
    const timeClassName = (selfMessage ? (viewed ? "message-time_self" : "message-time_self-not-viewed") : "message-time_other") + (type === "NORMAL" ? "" : "-code");
    const selectable = messageWindowState === MessageWindowState.SELECTABLE;
    const selectImage = selected ? activeCheckboxImage : disabledCheckboxImage;

    const handleMessageClick = () => {
        if (!selectable) {
            return;
        }

        handleSelectMessage();
    }

    const urlRegex = /((https?|ftp):\/\/[^\s/$.?#].[^\s]*)/gi;
    text = text.replace(urlRegex, (url) => {
        return `<a href="${url}" target="_blank" title="${url}">ССЫЛКА</a>`;
    });

    return (
        <>
            <Observer onIntercept={onIntercept} />
            <div onClick={handleMessageClick} className={classnames("message-wrapper", { "message-wrapper_self": selfMessage, "selectable": selectable })}>

                {selectable && <img className={classnames("select-message-icon")} src={selectImage} ></img>}
                <div className={classnames("message-container", className, { "selectable": selectable })} ref={lastMessageObserver}>

                    {type === "NORMAL" ?
                        <span className={classnames("message-text")} dangerouslySetInnerHTML={{ __html: text }} /> :
                        <CodeBlock
                            language="python"
                            code={text} />
                    }

                    <div style={{ display: 'flex' }}>
                        <span className={classnames("message-time", timeClassName)}>{createdAt}</span>
                        {selfMessage && viewed ? <img className="other-message-viewed" src={messageViewed} /> : <></>}
                    </div>
                </div>
            </div>
        </>

    );
};
