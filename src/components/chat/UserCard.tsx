import React, { FC } from "react";
import "../../styles/css/Chats.css";
import { MediumAvatar } from "./Avatar";

export type OnClickType = () => Promise<void>

export interface Props {
    key: string,
    id: number,
    name: string,
    status: string,
    onClick: OnClickType,
}


export const UserCard: FC<Props> = ({ key, id, name, status, onClick }) => {
    const onChatClick = () => {
        onClick();
    }
    const splitedStr = name.split(' ')
    const smallTitle = splitedStr.length > 1 ? splitedStr[0][0] + splitedStr[1][0] : splitedStr[0][0];
    return (
        <span className={'chat'} onClick={onChatClick} key={key}>
            {/* <img src="path/to/image.png" alt="Изображение"></img> */}
            <span id={id.toString()}></span>
            <MediumAvatar smallTitle={smallTitle} fullName={name} />
            <div className="container">
                <div className="title">{name}</div>
                <div className="text">{status}</div>
            </div>
            <div className="chat-message-info-container">
                <span className="time" style={{ opacity: '0' }}>00:00</span>
            </div>

        </span>
    );
};
