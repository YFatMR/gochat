import { makeAutoObservable } from "mobx"
import { AuthService } from "../services/AuthService";
import { ChatService } from "../services/ChatService"
export enum ScreenState {
    Registration,
    Autorization,
    Main,
}

export class Store {
    constructor() {
        makeAutoObservable(this)
    }

    async login(email: string, password: string) {
        try {
            const response = await AuthService.login(email, password)
            console.log(response)
            localStorage.setItem("token", response.data.accessToken)
            if (response.status === 200) {
                return true
            }
        } catch (e) {
            console.log("Error", e)
        }
        return false
    }

    async registration(name: string, surname: string, nickname: string, login: string, password: string) {
        try {
            const response = await AuthService.registration(name, surname, nickname, login, password)
            console.log(response)
            localStorage.setItem("userID", response.data.ID)
            if (response.status === 200) {
                return true
            }
        } catch (e) {
            console.log("Error", e)
        }
        return false
    }

    async checkAuth() {
        try {
        } catch (e) {
            console.log("Error", e)
        }
    }
}