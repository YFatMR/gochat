import { FC, useContext, useState, useEffect, useRef, MouseEvent } from "react";

import { Chat } from "./Chat"
import {
    ChatInfo,
    Dialog,
    ChatsResponse,
    UserDataWithID,
} from "../../types/Chats"

import Observer from "../common/Observer";

import { BardDialog } from "./BardDialog"

import { ChatService } from "../../services/ChatService";

import { UserCard } from "./UserCard"

import { UserService } from "../../services/UserService";

// CSS
import "../../styles/css/Chats.css";


interface Props {
    activeDialog: ChatInfo | null
    setActiveDialog: React.Dispatch<React.SetStateAction<ChatInfo | null>>

    chats: ChatInfo[]
    setChats: React.Dispatch<React.SetStateAction<ChatInfo[]>>

    isActiveBardDialog: boolean
    setIsActiveBardDialog: React.Dispatch<React.SetStateAction<boolean>>
}

export const chatInfoFromResponse = (dialog: Dialog): ChatInfo => {
    return {
        id: parseInt(dialog.dialogID.ID),
        name: dialog.name,
        unreadMessagesCount: parseInt(dialog.unreadMessagesCount),
        lastMessage: {
            id: parseInt(dialog.lastMessage.messageID.ID),
            text: dialog.lastMessage.text,
            createdAt: new Date(dialog.lastMessage.createdAt),
            selfMessage: dialog.lastMessage.selfMessage,
            viewed: dialog.lastMessage.viewed,
            type: parseInt(dialog.lastMessage.type),
        },
        lastReadMessage: {
            id: parseInt(dialog.lastReadMessage.messageID.ID),
            text: dialog.lastReadMessage.text,
            createdAt: new Date(dialog.lastReadMessage.createdAt),
            selfMessage: dialog.lastReadMessage.selfMessage,
            viewed: dialog.lastReadMessage.viewed,
            type: parseInt(dialog.lastReadMessage.type),
        },
    }
}


const chatsFromResponse = (response: ChatsResponse): ChatInfo[] => {
    return response.dialogs ? response.dialogs.map(dialog => {
        return chatInfoFromResponse(dialog)
    }) : []
}

export const DialogsList: React.FC<Props> = ({ activeDialog, setActiveDialog, chats, setChats, isActiveBardDialog, setIsActiveBardDialog }) => {
    const chatsCountPerRequest = 30

    const searchFriendTextarea = useRef<HTMLTextAreaElement>(null);
    const [searchFriendText, setSearchFriendText] = useState<string>('');

    const [usersData, setUsersData] = useState<UserDataWithID[]>([])

    const fetchBottomChats = async () => {
        if (chats.length < 10 && chats.length !== 0) {
            return
        }
        const response = await ChatService.getDialogs(chatsCountPerRequest, chats.length);
        console.log("fetchBottomChats response", response, "chat length", chats.length)
        if (response.status != 200) {
            // navigate("")
            return
        }
        const newChats = chatsFromResponse(response.data)
        if (newChats.length === 0) {
            return
        }
        if (chats.length === 0) {
            setChats(newChats)
            return
        }
        setChats([...chats, ...newChats]);
    }

    const fetchUsersByPrefix = async () => {
        const response = await UserService.getUsersByPrefix(searchFriendText, 30)
        if (response.status !== 200) {
            console.error(response)
            return
        }
        console.log("Set data", response)
        if (response.data.usersData) {
            console.log("COUNT", response.data.usersData.length)
            setUsersData(response.data.usersData)
        } else {
            setUsersData([])
        }
    }

    const onUserCardClick = async (userData: UserDataWithID) => {
        const response = await ChatService.createDialogWith(userData.userID.ID)
        if (response.status !== 200) {
            console.error(response)
        }
        setSearchFriendText("")
        await fetchBottomChats()
        setActiveDialog(chatInfoFromResponse(response.data))
    }

    useEffect(() => {
        if (searchFriendText.length === 0) {
            fetchBottomChats()
            return
        }
        fetchUsersByPrefix()
    }, [searchFriendText])

    return (
        <div className="left-container">
            <textarea
                ref={searchFriendTextarea}
                className="search-string-textarea"
                placeholder="Введите ник для поиска..."
                value={searchFriendText}
                onChange={(event) => { setSearchFriendText(event.target.value) }}
            />
            <>
                {searchFriendText.length === 0 && <BardDialog
                    key="bard"
                    name="Bard"
                    onClick={async () => {
                        setIsActiveBardDialog(true)
                        setActiveDialog(null)
                    }}
                    isActive={isActiveBardDialog}
                />}
                {searchFriendText.length === 0 && chats.map((chat) => (
                    <Chat
                        key={chat.id.toString()}
                        id={chat.id}
                        name={chat.name}
                        unreadMessagesCount={chat.unreadMessagesCount || 0}
                        lastMessage={{
                            id: chat.lastMessage.id,
                            text: chat.lastMessage.text,
                            createdAt: `${chat.lastMessage.createdAt.getHours()}:${chat.lastMessage.createdAt.getMinutes().toString().padStart(2, '0')}`,
                        }}
                        onClick={async () => {
                            setActiveDialog(chat)
                            setIsActiveBardDialog(false)
                        }}
                        isActive={activeDialog?.id === chat.id}
                    />
                ))}
                {searchFriendText.length === 0 && <Observer height='10px' onIntercept={() => {
                    fetchBottomChats()
                }} />}
            </>
            <>
                {searchFriendText.length !== 0 && usersData.map((userData) => (
                    <UserCard
                        key={userData.userID.ID.toString()}
                        id={userData.userID.ID}
                        name={userData.name + " " + userData.surname}
                        status={userData.nickname}
                        onClick={async () => { onUserCardClick(userData) }}
                    />
                ))}
            </>

        </div>
    )
}