import { FC, useContext, useState, useEffect, useRef, MouseEvent } from "react";
import { useNavigate } from 'react-router-dom';
import { ChatService } from "../services/ChatService";
import {
    ChatInfo,
    NewMessageWSEvent,
    ViewedMessageWSEvent,
    UserData,
    MessageInfo,
} from "../types/Chats"
import "../styles/css/Chats.css";
import { API_HOST } from "../http/index"
import useWebSocket from 'react-use-websocket';
import { SmallAvatar } from "../components/chat/Avatar"
import { DialogInfoPanel } from "../components/chat/DialogInfoPanel"
import { DialogsList, chatInfoFromResponse } from "../components/chat/DialogsList"
import { MessagesList } from "../components/chat/MessagesList"
import { BardDialog } from "../components/chat/BardDialog"

// Images
import infoIcon from "../assets/info.png";
import { UserService } from "../services/UserService";




const ChatsPage: FC = () => {
    const navigate = useNavigate();

    const [chats, setChats] = useState<ChatInfo[]>([]);
    const [messages, setMessages] = useState<MessageInfo[]>([]);

    const [activeDialog, setActiveDialog] = useState<ChatInfo | null>(null);
    const [isActiveDialogInfo, setIsActiveDialogInfo] = useState<boolean>(false);

    const [isActiveBardDialog, setIsActiveBardDialog] = useState<boolean>(false);


    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const [prevScrollHeight, setPrevScrollHeight] = useState(0);

    // const setUniqueAndSortedMessages = (arr: MessageInfo[]) => {
    //     if (!activeDialog || !lastReadMessage) {
    //         return
    //     }
    //     const unreadMessagesCountBefore = messages.reduce((count, message) => {
    //         if (message.viewed && !message.selfMessage) {
    //             return count + 1;
    //         }
    //         return count;
    //     }, 0);
    //     const newMessages = [...arr].map((message) => {
    //         if (message.viewed || message.selfMessage) {
    //             return message
    //         }
    //         // чужое сообщение просматриваем
    //         message.viewed = message.createdAt <= lastReadMessage.createdAt
    //         return message
    //     })
    //     const uniqueMessages = newMessages.filter(
    //         (message, index, self) => self.findIndex((m) => m.id === message.id) === index
    //     );

    //     const unreadMessagesCountAfter = uniqueMessages.reduce((count, message) => {
    //         if (message.viewed === true && !message.selfMessage) {
    //             return count + 1;
    //         }
    //         return count;
    //     }, 0);
    //     console.log("diff", unreadMessagesCountBefore - unreadMessagesCountAfter)
    //     const newDialog = activeDialog
    //     newDialog.unreadMessagesCount -= unreadMessagesCountBefore - unreadMessagesCountAfter

    //     setMessages(uniqueMessages)
    //     setActiveDialog(newDialog)
    // }


    const [activeDialogUserData, setActiveDialogUserData] = useState<UserData>();

    const { sendJsonMessage, lastJsonMessage } = useWebSocket(`ws://${API_HOST}/v1/ws?token=${localStorage.getItem('token')}`, {
        onOpen: () => console.log('WebSocket opened'),
        onClose: () => console.log('WebSocket closed'),
        onError: (event) => console.error('WebSocket error:', event),
        onMessage: async (data: any) => {
            const parsedData = JSON.parse(data.data)
            console.log("Websocket event", parsedData)
            if (parsedData.wsType === "new_message") {
                const newMessageEvent = parsedData as NewMessageWSEvent

                // update dialog list order
                var newChats = [...chats]
                const existChatIdx = newChats.findIndex(chat => chat.id == newMessageEvent.dialogID.ID)
                const newDialog = await ChatService.getDialogByID(newMessageEvent.dialogID.ID)
                if (existChatIdx === -1) {
                    // load dialog
                    newChats = [chatInfoFromResponse(newDialog.data), ...newChats]
                } else {
                    // set new params
                    newChats[existChatIdx].lastMessage = {
                        id: newMessageEvent.messageID.ID,
                        text: newDialog.data.lastMessage.text,
                        createdAt: new Date(newDialog.data.lastMessage.createdAt),
                        selfMessage: false, // only other members messages
                        viewed: false,
                        type: parseInt(newMessageEvent.type),
                    }
                    newChats[existChatIdx].unreadMessagesCount = parseInt(newDialog.data.unreadMessagesCount) || 0
                    console.log("ERRRR!!", newDialog.data.unreadMessagesCount)
                }
                newChats.sort((a: ChatInfo, b: ChatInfo) => {
                    return b.lastMessage.createdAt.getTime() - a.lastMessage.createdAt.getTime()
                });
                setChats(newChats)

                const messageToCurrentDialog = activeDialog !== null && activeDialog.id == newMessageEvent.dialogID.ID
                if (!messageToCurrentDialog) {
                    // ignore if not current dialog message
                    return
                }
                const message = {
                    id: newMessageEvent.messageID.ID,
                    text: newMessageEvent.text,
                    createdAt: new Date(newMessageEvent.createdAt),
                    selfMessage: false,
                    viewed: false, // someone else's message that the user has not yet seen
                    lastMessageObserver: null,
                    type: parseInt(newMessageEvent.type),
                }
                if (messagesContainerRef.current) {
                    setPrevScrollHeight(messagesContainerRef.current.scrollHeight);
                }
                setMessages([...messages, message])
                console.log('WebSocket data', data)
            } else if (parsedData.wsType === "viewed") {
                const viewedMessageEvent = parsedData as ViewedMessageWSEvent
                const activeDialogAction = activeDialog !== null && activeDialog.id == viewedMessageEvent.dialogID.ID
                if (!activeDialogAction || !messagesContainerRef.current) {
                    // ignore if not current dialog event
                    return
                }
                const newMessages = [...messages].map((message) => {
                    if (message.viewed && message.selfMessage) {
                        return message
                    }
                    message.viewed = message.createdAt <= new Date(viewedMessageEvent.messageCreatedAt)
                    return message
                })
                setPrevScrollHeight(messagesContainerRef.current.scrollTop);
                setMessages([...newMessages])
                return
            } else {
                console.error("Websocket unknown event with type", parsedData)
                return
            }

        },
        shouldReconnect: (closeEvent) => true,
        reconnectAttempts: 10,
        reconnectInterval: 3000,
    });

    const smallTitleFromString = (str: string) => {
        if (str.length == 0) {
            return "e"
        }
        const splited = str.split(' ')
        if (splited.length == 0) {
            return "E";
        } else if (splited.length == 1) {
            return splited[0][0];
        }
        return splited[0][0] + splited[1][0];
    }

    return (
        <div className="main-container">
            <DialogsList
                activeDialog={activeDialog}
                setActiveDialog={setActiveDialog}
                chats={chats}
                setChats={setChats}
                isActiveBardDialog={isActiveBardDialog}
                setIsActiveBardDialog={setIsActiveBardDialog}
            />
            <div className="central-container">
                {activeDialog &&
                    <div style={
                        {
                            height: '50px', background: 'white', borderLeft: '1px solid #F7F7F7',
                            borderRight: '1px solid #F7F7F7', borderBottom: '1px solid #F7F7F7',
                            display: 'flex', alignItems: 'center', paddingLeft: '20px',
                            justifyContent: 'space-between'
                        }}>
                        <div>
                            <SmallAvatar smallTitle={smallTitleFromString(activeDialog.name)} fullName={activeDialog.name} />
                        </div>
                        <img
                            src={infoIcon}
                            style={{ width: '24px', height: '24px', marginRight: '30px' }}
                            onClick={async () => {
                                const dialogMembers = await ChatService.getDialogMembers(activeDialog.id)
                                if (dialogMembers.status !== 200) {
                                    alert("Connection error")
                                    return
                                }
                                const userData = await UserService.getUserData(dialogMembers.data.memberID.ID)
                                if (userData.status !== 200) {
                                    alert("Connection error")
                                    return
                                }
                                setActiveDialogUserData(userData.data)
                                setIsActiveDialogInfo(true)
                            }} />
                    </div>}
                <MessagesList
                    activeDialog={activeDialog}
                    messages={messages}
                    setMessages={setMessages}
                    messagesContainerRef={messagesContainerRef}
                    prevScrollHeight={prevScrollHeight}
                    setPrevScrollHeight={setPrevScrollHeight}
                    isActiveBardDialog={isActiveBardDialog}
                    setActiveDialogUnreadMessagesCount={(count: number) => {
                        if (!activeDialog) {
                            return
                        }
                        const newChats = chats.map((chat) => {
                            if (chat.id != activeDialog.id) {
                                return chat
                            }
                            chat.unreadMessagesCount = count
                            return chat
                        })

                        const newActiveDialog = activeDialog
                        newActiveDialog.unreadMessagesCount = count
                        setActiveDialog(newActiveDialog)
                        setChats(newChats)
                    }}
                />
            </div>
            <DialogInfoPanel
                activeDialog={activeDialog}
                isActive={isActiveDialogInfo}
                setIsActive={setIsActiveDialogInfo}
                github={activeDialogUserData ? activeDialogUserData.github : null}
                username={activeDialogUserData ? activeDialogUserData.nickname : null}
                status={activeDialogUserData ? activeDialogUserData.statusText : "status"}
            />
        </div >
    );
};

export default ChatsPage;
