import { FC, useContext, useState } from "react";
import { Context } from "../..";
import { InputField } from './InputField';
import { ContinueButton } from './ContinueButton';
import "../../styles/css/Auth.css";
import { Link } from "react-router-dom";

const RegistrationForm: FC = () => {
    const [name, setName] = useState<string>("")
    const [surname, setSurname] = useState<string>("")
    const [nickname, setNickname] = useState<string>("")
    const [login, setLogin] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const { store } = useContext(Context)

    return (
        <div className="half-center">
            <div className="auth-form-main-container">
                <div className="auth-top-text-container">
                    <p className="auth-text-huge">Create new account</p>
                    <p className="auth-text-medium">Glad to see you! Please enter your details.</p>
                </div>

                <div className="auth-form-center-28px-container">
                    <div className="auth-form-left-24px-container">
                        <div className="auth-form-left-16px-container">
                            <InputField
                                label="Name"
                                value={name}
                                type="text"
                                placeholder="Введите имя"
                                onChange={(e) => setName(e.target.value)}
                            />
                            <InputField
                                label="Surname"
                                value={surname}
                                type="text"
                                placeholder="Введите фамилию"
                                onChange={(e) => setSurname(e.target.value)}
                            />
                            <InputField
                                label="Nickname"
                                value={nickname}
                                type="text"
                                placeholder="Введите никнейм"
                                onChange={(e) => setNickname(e.target.value)}
                            />
                            <InputField
                                label="Email"
                                value={login}
                                type="text"
                                placeholder="Введите gjxne"
                                onChange={(e) => setLogin(e.target.value)}
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
                            isLoading={false}
                            onClick={() => store.registration(name, surname, nickname, login, password)}
                        />
                    </div>

                    <p className="auth-text-small">Already have an account? <Link to="/" relative="path">Log in</Link></p>
                </div>
            </div>

        </div>
    );
};

export default RegistrationForm;
