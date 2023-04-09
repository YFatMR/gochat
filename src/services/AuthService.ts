import $api from "../http";
import { AxiosResponse } from "axios";
import { AuthResponse } from "../models/response/Auth";

export default class AuthService {
    static async login(email: string, password: string): Promise<AxiosResponse<AuthResponse>> {
        return $api.post<AuthResponse>("/token", { email, password })
    }

    static async registration(email: string, password: string): Promise<AxiosResponse<AuthResponse>> {
        return $api.post<AuthResponse>("/users", { email, password })
    }
}