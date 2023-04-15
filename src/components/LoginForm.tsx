import React, { FC, useContext, useState } from "react";

import { Context } from "..";

import authImage from '../assets/image/auth.png';

import { LoginContinue, LoginInput } from './atoms/LoginFormInput';
import '../assets/css/LoginFormInput.css';

const LoginForm: FC = () => {
    const [login, setLogin] = useState<string>("")
    const [password, setPassword] = useState<string>("")

    const { store } = useContext(Context)
    return (
        <div className="auth-screen-container">
            <div className="auth-form-container">
                <div className="auth-top-text-container">
                    <p className="auth-text-huge">Welcome back</p>
                    <p className="auth-text-medium">Glad to see you! Please enter your details.</p>
                </div>

                <div className="auth-form-container">
                    <LoginInput
                        label="Login"
                        value={login}
                        type="text"
                        placeholder="Enter your login"
                        onChange={(e) => setLogin(e.target.value)}
                    />
                    <LoginInput
                        label="Password"
                        value={password}
                        type="password"
                        placeholder="Enter your password"
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <LoginContinue
                        value="Continue"
                        onClick={() => store.login(login, password)}
                    />
                </div>

            </div>
            <img className="auth-screen-image" src={authImage} />
        </div>
    );
};

export default LoginForm;
