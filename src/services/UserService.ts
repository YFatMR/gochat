import $api, { API_URL } from "../http";
import { AxiosResponse } from "axios";
import { UserData, GetUsersByPrefixResponse } from "../types/Chats";

export class UserService {
    static async getUserData(userID: number): Promise<AxiosResponse<UserData>> {
        return $api.get(`${API_URL}/v1/users/${userID}`)
    }

    static async getUsersByPrefix(prefix: string, limit: number): Promise<AxiosResponse<GetUsersByPrefixResponse>> {
        return $api.post(`${API_URL}/v1/users/find?limit=${limit}`, { prefix })
    }
}
