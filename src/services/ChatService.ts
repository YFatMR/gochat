import $api, { API_URL } from "../http";
import { AxiosResponse } from "axios";
import {
    ChatsResponse,
    MessagesResponse,
    CreateMessageResponse,
    Dialog,
    LinksResponse,
    DialogMembersResponse,
    DialogUnreadMessagesCount,
    InstructionsResponse,
    BardAnswer,
} from "../types/Chats";

export class ChatService {
    static async getDialogs(limit: number, offset: number): Promise<AxiosResponse<ChatsResponse>> {
        return $api.get(`${API_URL}/v1/dialogs?limit=${limit}&offset=${offset}`)
    }

    static async createDialogWith(userID: number): Promise<AxiosResponse<Dialog>> {
        return $api.post(`${API_URL}/v1/dialogs?userID=${userID}`)
    }

    static async getDialogByID(id: number): Promise<AxiosResponse<Dialog>> {
        return $api.get(`${API_URL}/v1/dialogs/${id}`)
    }

    static async readMessage(dialogID: number, messageID: number): Promise<AxiosResponse<void>> {
        return $api.put(`${API_URL}/v1/dialogs/${dialogID}/messages/${messageID}`)
    }

    static async getMessagesBefore(chatID: number, beforeMessageID: number, limit: number): Promise<AxiosResponse<MessagesResponse>> {
        return $api.get(`${API_URL}/v1/dialogs/${chatID}/messages/${beforeMessageID}?limit=${limit}&offset_type=before`)
    }

    static async getMessagesBeforeAndInclude(chatID: number, beforeMessageID: number, limit: number): Promise<AxiosResponse<MessagesResponse>> {
        return $api.get(`${API_URL}/v1/dialogs/${chatID}/messages/${beforeMessageID}?limit=${limit}&offset_type=before_include`)
    }

    static async getMessagesAfter(chatID: number, afterMessageID: number, limit: number): Promise<AxiosResponse<MessagesResponse>> {
        return $api.get(`${API_URL}/v1/dialogs/${chatID}/messages/${afterMessageID}?limit=${limit}&offset_type=after`)
    }

    static async getMessagesAfterAndInclude(chatID: number, afterMessageID: number, limit: number): Promise<AxiosResponse<MessagesResponse>> {
        return $api.get(`${API_URL}/v1/dialogs/${chatID}/messages/${afterMessageID}?limit=${limit}&offset_type=after_include`)
    }

    static async createInstruction(chatID: number, title: string, text: string): Promise<AxiosResponse<void>> {
        return $api.post(`${API_URL}/v1/dialogs/${chatID}/instructions`, {
            title,
            text,
        })
    }

    static async createMessage(chatID: number, text: string): Promise<AxiosResponse<CreateMessageResponse>> {
        return $api.post(`${API_URL}/v1/dialogs/${chatID}/messages`, {
            text,
        })
    }

    static async createMessageWithCode(chatID: number, title: string, text: string): Promise<AxiosResponse<CreateMessageResponse>> {
        return $api.post(`${API_URL}/v1/dialogs/${chatID}/messages`, {
            title,
            text,
        })
    }

    static async getLinks(chatID: number, limit: number): Promise<AxiosResponse<LinksResponse>> {
        return $api.get(`${API_URL}/v1/dialogs/${chatID}/links?limit=${limit}`)
    }

    static async getLinksAfter(chatID: number, linkID: number, limit: number): Promise<AxiosResponse<LinksResponse>> {
        return $api.get(`${API_URL}/v1/dialogs/${chatID}/links?limit=${limit}&linkID=${linkID}&offset_type=after`)
    }

    static async getInstructions(chatID: number, limit: number): Promise<AxiosResponse<InstructionsResponse>> {
        return $api.get(`${API_URL}/v1/dialogs/${chatID}/instructions?limit=${limit}`)
    }

    static async getInstructionsAfter(chatID: number, instructionID: number, limit: number): Promise<AxiosResponse<InstructionsResponse>> {
        return $api.get(`${API_URL}/v1/dialogs/${chatID}/instructions?limit=${limit}&instructionID=${instructionID}&offset_type=after`)
    }

    static async getDialogMembers(dialogID: number): Promise<AxiosResponse<DialogMembersResponse>> {
        return $api.get(`${API_URL}/v1/dialogs/${dialogID}/members`)
    }

    static async getDialogUnreadMessagesCount(dialogID: number): Promise<AxiosResponse<DialogUnreadMessagesCount>> {
        return $api.get(`${API_URL}/v1/dialogs/${dialogID}/unread_messages`)
    }

    static async getBardAnswer(text: string): Promise<AxiosResponse<BardAnswer>> {
        return $api.post(`http://localhost:15000`, { text: text })
    }
}
