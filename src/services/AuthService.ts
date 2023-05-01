import $api from "../http";
import { AxiosResponse } from "axios";
import { AuthResponse, RegistrationResponse } from "../types/Auth";

export class AuthService {
    static async login(email: string, password: string): Promise<AxiosResponse<AuthResponse>> {
        return $api.post<AuthResponse>("/v1/token", { email, password })
    }

    static async registration(name: string, surname: string, nickname: string,
        login: string, password: string): Promise<AxiosResponse<RegistrationResponse>> {
        return $api.post<RegistrationResponse>("/v1/users", {
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
