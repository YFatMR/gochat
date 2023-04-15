import $api from "../http";
import { AxiosResponse } from "axios";
import { AuthResponse, RegistrationResponse } from "../models/response/Auth";

export default class AuthService {
    static async login(login: string, password: string): Promise<AxiosResponse<AuthResponse>> {
        return $api.post<AuthResponse>("/token", { login, password })
    }

    static async registration(name: string, surname: string, nickname: string,
        login: string, password: string): Promise<AxiosResponse<RegistrationResponse>> {
        return $api.post<RegistrationResponse>("/users", {
            userData: {
                nickname,
                name,
                surname
            },
            credential: {
                login,
                password
            }
        })
    }
}
