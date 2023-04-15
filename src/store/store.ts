import { makeAutoObservable } from "mobx"
import AuthService from "../services/AuthService";

export enum ScreenState {
    Registration,
    Autorization,
    Main,
}

export class Store {
    isAuth = false;
    screenState = ScreenState.Autorization

    constructor() {
        makeAutoObservable(this)
    }


    setAuth(auth: boolean) {
        this.isAuth = auth
    }

    setAutorizationState() {
        this.screenState = ScreenState.Autorization
    }

    setRegistrationState() {
        this.screenState = ScreenState.Registration
    }

    setMainState() {
        this.screenState = ScreenState.Main
    }

    async login(login: string, password: string) {
        try {
            const response = await AuthService.login(login, password)
            console.log(response)
            localStorage.setItem("token", response.data.accessToken)
            this.setAuth(true)
            if (response.status === 200) {
                this.setMainState()
                return true
            }
        } catch (e) {
            // console.log(e.response?.data?.message)
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
                this.setAutorizationState()
                return true
            }

            // this.setAuth(true)
        } catch (e) {
            // console.log(e.response?.data?.message)
            console.log("Error", e)
        }
        return false
    }

    async checkAuth() {
        try {
        } catch (e) {
            // console.log(e.response?.data?.message)
            console.log("Error", e)
        }
    }
}