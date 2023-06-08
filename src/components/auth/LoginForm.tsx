import { FC, useContext, useState } from "react";

import { Context } from "../..";

import { InputField } from './InputField';
import { ContinueButton } from './ContinueButton';
import { useNavigate } from 'react-router-dom';
import "../../styles/css/Auth.css";
import { Link } from "react-router-dom";


interface LoginFormProps {
    successRedirectUrl: string;

}

export const LoginForm: FC<LoginFormProps> = ({ successRedirectUrl }) => {
    const [email, setEmail] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const navigate = useNavigate();

    const { store } = useContext(Context)

    const login = async () => {
        if (isLoading) return;

        setIsLoading(true);
        const success = await store.login(email, password);
        setIsLoading(false);

        if (success) {
            navigate(successRedirectUrl)
        }
    }
    return (
        <div className="half-center">
            <div className="auth-form-main-container">
                <div className="auth-top-text-container">
                    <p className="auth-text-huge">Welcome back</p>
                    <p className="auth-text-medium">Glad to see you! Please enter your details.</p>
                </div>

                <div className="auth-form-center-28px-container">
                    <div className="auth-form-left-24px-container">
                        <div className="auth-form-left-16px-container">
                            <InputField
                                label="Email"
                                value={email}
                                type="email"
                                placeholder="Введите почту"
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <InputField
                                label="Password"
                                value={password}
                                type="password"
                                placeholder="Введите пароль"
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <ContinueButton
                            value="Continue"
                            isLoading={isLoading}
                            onClick={login}
                        />
                    </div>
                    <p className="auth-text-small">Do not have an account? <Link to="/register" relative="path">Sign up</Link></p>
                </div>

            </div>
        </div>
    );
};
