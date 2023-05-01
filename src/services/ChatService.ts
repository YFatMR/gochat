import $api from "../http";
import { AxiosResponse } from "axios";
import { ChatsResponse, MessagesResponse } from "../types/Chats";

export class ChatService {
    static async getDialogs(limit: number, offset: number): Promise<AxiosResponse<ChatsResponse>> {
        return $api.get(`/v1/dialogs?limit=${limit}&offset=${offset}`)
    }

    static async getMessagesBefore(chatID: number, beforeMessageID: number, limit: number): Promise<AxiosResponse<MessagesResponse>> {
        return $api.get(`/v1/dialogs/${chatID}/messages/${beforeMessageID}?limit=${limit}&offset_type=before`)
    }

    static async getMessagesAfter(chatID: number, afterMessageID: number, limit: number): Promise<AxiosResponse<MessagesResponse>> {
        return $api.get(`/v1/dialogs/${chatID}/messages/${afterMessageID}?limit=${limit}&offset_type=after`)
    }
}
