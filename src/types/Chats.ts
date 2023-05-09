export interface DialogID {
    ID: string
}

export interface UserID {
    ID: string
}

export interface MessageID {
    ID: string
}

export interface MessageResponse {
    messageID: MessageID
    senderID: UserID
    text: string
    createdAt: string
    selfMessage: boolean
}

export interface Dialog {
    dialogID: DialogID
    name: string
    unreadMessagesCount: string
    lastMessage: MessageResponse
    lastReadMessage: MessageResponse
}

export interface ChatsResponse {
    dialogs: Dialog[];
}

export interface MessagesResponse {
    messages: MessageResponse[]
};

export interface CreateMessageResponse {
    createdAt: string
    messageID: MessageID
};

export interface ChatInfo {
    id: number
    messageID: number
    name: string
    messageText: string
    messageTimestamp: Date
    unreadMessagesCount: number
}

export interface MessageInfo {
    id: number
    text: string
    createdAt: Date
    selfMessage: boolean
    lastMessageObserver: any
};

export interface NewMessageEvent {
    messageID: {
        ID: number,
    }
    senderID: {
        ID: number,
    }
    reciverID: {
        ID: number,
    }
    dialogID: {
        ID: number,
    }
    text: string
    createdAt: string
}
