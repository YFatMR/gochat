import React, { FC } from "react";
import "../../styles/css/Chats.css";
import { MediumAvatar } from "./Avatar";

export type OnClickType = () => Promise<void>

export interface Props {
    key: string,
    name: string,
    onClick: OnClickType,
    isActive: boolean,
}


export const BardDialog: FC<Props> = ({ name, onClick, isActive }) => {
    const onChatClick = () => {
        onClick();
    }
    const splitedStr = name.split(' ')
    const smallTitle = splitedStr.length > 1 ? splitedStr[0][0] + splitedStr[1][0] : splitedStr[0][0];
    return (
        <button className={isActive ? 'chat_active chat' : 'chat'} onClick={onChatClick}>
            {/* <img src="path/to/image.png" alt="Изображение"></img> */}
            <span ></span>
            <MediumAvatar smallTitle={smallTitle} fullName={name} />
            <div className="container">
                <div className="title">{name}</div>
                <div className="text">Bot</div>
            </div>
            <div className="chat-message-info-container">
                <span style={{ color: '#ffffff', opacity: '0' }}>00:00</span>
            </div>

        </button>
    );
};