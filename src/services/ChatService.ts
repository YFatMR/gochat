import $api from "../http";
import { AxiosResponse } from "axios";
import { ChatsResponse, MessagesResponse } from "../types/Chats";

export class ChatService {
    static async getDialogs(limit: number, offset: number): Promise<AxiosResponse<ChatsResponse>> {
        return $api.get(`/v1/dialogs?limit=${limit}&offset=${offset}`)
    }

    static async getMessages(chatID: string, limit: number, offset: number): Promise<AxiosResponse<MessagesResponse>> {
        return $api.get(`/v1/dialogs/${chatID}/messages?limit=${limit}&offset=${offset}`)
    }
}
