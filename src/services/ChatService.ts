import $api from "../http";
import { AxiosResponse } from "axios";
import { ChatsResponse, MessagesResponse, CreateMessageResponse, Dialog } from "../types/Chats";

export class ChatService {
    static async getDialogs(limit: number, offset: number): Promise<AxiosResponse<ChatsResponse>> {
        return $api.get(`/v1/dialogs?limit=${limit}&offset=${offset}`)
    }

    static async getDialogByID(id: number): Promise<AxiosResponse<Dialog>> {
        return $api.get(`/v1/dialogs/${id}`)
    }

    static async readAllMessagesBeforeIncl(dialogID: number, messageID: number): Promise<AxiosResponse<void>> {
        return $api.put(`/v1/dialogs/${dialogID}/messages/${messageID}?type=include`)
    }

    static async getMessagesBefore(chatID: number, beforeMessageID: number, limit: number): Promise<AxiosResponse<MessagesResponse>> {
        return $api.get(`/v1/dialogs/${chatID}/messages/${beforeMessageID}?limit=${limit}&offset_type=before`)
    }

    static async getMessagesBeforeAndInclude(chatID: number, beforeMessageID: number, limit: number): Promise<AxiosResponse<MessagesResponse>> {
        return $api.get(`/v1/dialogs/${chatID}/messages/${beforeMessageID}?limit=${limit}&offset_type=before_include`)
    }

    static async getMessagesAfter(chatID: number, afterMessageID: number, limit: number): Promise<AxiosResponse<MessagesResponse>> {
        return $api.get(`/v1/dialogs/${chatID}/messages/${afterMessageID}?limit=${limit}&offset_type=after`)
    }

    static async getMessagesAfterAndInclude(chatID: number, afterMessageID: number, limit: number): Promise<AxiosResponse<MessagesResponse>> {
        return $api.get(`/v1/dialogs/${chatID}/messages/${afterMessageID}?limit=${limit}&offset_type=after_include`)
    }

    static async sendMessage(chatID: number, text: string): Promise<AxiosResponse<CreateMessageResponse>> {
        return $api.post(`/v1/dialogs/${chatID}/messages`, {
            text,
        })
    }
}
