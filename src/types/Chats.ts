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
    type: string
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
        type: number
    }
    lastReadMessage: {
        id: number
        text: string
        createdAt: Date
        selfMessage: boolean
        viewed: boolean
        type: number
    }
}

export interface MessageInfo {
    id: number
    text: string
    createdAt: Date
    selfMessage: boolean
    viewed: boolean
    lastMessageObserver: any
    type: number
};

export interface NewMessageWSEvent {
    wsType: string
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
    wsType: string
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

export interface LinkID {
    ID: string
}

export interface Link {
    linkID: LinkID
    link: string
    messageID: MessageID
    createdAt: string
}

export interface LinksResponse {
    links: Link[]
}

export interface LinkInfo {
    id: number
    link: string
    messageID: number
    createdAt: Date
}

export interface Instruction {
    instructionID: {
        ID: number,
    }
    createdAt: string
    title: string
    text: string
}

export interface InstructionsResponse {
    instructions: Instruction[]
}

export interface InstructionInfo {
    id: number
    createdAt: Date
    title: string
    text: string
}


export interface DialogMembersResponse {
    selfID: {
        ID: number
    }
    memberID: {
        ID: number
    }
}

export interface UserData {
    nickname: string
    name: string
    surname: string
    statusText: string
    github: string | null
    linkedin: string | null
    publicEmail: string | null
}

export interface UserDataWithID {
    userID: {
        ID: number,
    }
    nickname: string
    name: string
    surname: string
    statusText: string
    github: string | null
    linkedin: string | null
    publicEmail: string | null
}

export interface GetUsersByPrefixResponse {
    usersData: UserDataWithID[]
}

export interface DialogUnreadMessagesCount {
    count: number | null
}

export interface BardAnswer {
    text: string
}
