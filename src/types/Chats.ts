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
    viewed: boolean
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
    name: string
    unreadMessagesCount: number
    lastMessage: {
        id: number
        text: string
        createdAt: Date
        selfMessage: boolean
        viewed: boolean
    }
    lastReadMessage: {
        id: number
        text: string
        createdAt: Date
        selfMessage: boolean
        viewed: boolean
    }
}

export interface MessageInfo {
    id: number
    text: string
    createdAt: Date
    selfMessage: boolean
    viewed: boolean
    lastMessageObserver: any
};

export interface NewMessageWSEvent {
    type: string
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

export interface ViewedMessageWSEvent {
    type: string
    messageID: {
        ID: number,
    }
    senderID: {
        ID: number,
    }
    dialogID: {
        ID: number,
    }
    messageCreatedAt: string
}

export enum MessageWindowState {
    SELECTABLE,
    NORMAL,
}
