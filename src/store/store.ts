import { makeAutoObservable } from "mobx"
import AuthService from "../services/AuthService";

export default class Store {
    isAuth = false;

    constructor() {
        makeAutoObservable(this)
    }

    setAuth(auth: boolean) {
        this.isAuth = auth
    }

    async login(email: string, password: string) {
        try {
            const response = await AuthService.login(email, password)
            console.log(response)
            localStorage.setItem("token", response.data.accessToken)
            this.setAuth(true)
        } catch (e) {
            // console.log(e.response?.data?.message)
            console.log("Error")
        }
    }
}