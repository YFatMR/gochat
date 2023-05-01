export interface DialogID {
    ID: string;
}

export interface Message {
    messageID: {
        ID: string;
    },
    senderID: {
        ID: string;
    },
    text: string,
    createdAt: string,
    selfMessage: boolean,
}

export interface Dialog {
    dialogID: DialogID;
    name: string;
    messagesCount: string;
    unreadMessagesCount: string,
    lastMessage: Message;
}

export interface ChatsResponse {
    dialogs: Dialog[];
}

export interface MessagesResponse {
    messages: Message[];
};
