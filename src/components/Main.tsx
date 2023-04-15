import React, { FC, useContext, useState } from "react";

import { Context } from "..";

import authImage from '../assets/image/auth.png';

import { LoginContinue, LoginInput } from './atoms/LoginFormInput';
import '../assets/css/LoginFormInput.css';
import { ScreenState } from '../store/store';

const MainPage: FC = () => {
    const [loginLogin, setLoginLogin] = useState<string>("")
    const [loginPassword, setLoginPassword] = useState<string>("")


    const [name, setName] = useState<string>("")
    const [surname, setSurname] = useState<string>("")
    const [nickname, setNickname] = useState<string>("")
    const [login, setLogin] = useState<string>("")
    const [password, setPassword] = useState<string>("")

    const [currState, changeState] = useState(ScreenState.Autorization);

    const { store } = useContext(Context)

    if (currState == ScreenState.Autorization) {
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
                            value={loginLogin}
                            type="text"
                            placeholder="Enter your login"
                            onChange={(e) => setLoginLogin(e.target.value)}
                        />
                        <LoginInput
                            label="Password"
                            value={loginPassword}
                            type="password"
                            placeholder="Enter your password"
                            onChange={(e) => setLoginPassword(e.target.value)}
                        />
                        <LoginContinue
                            value="Continue"
                            onClick={() => store.login(login, password).then((success) => {
                                if (success) {
                                    changeState(ScreenState.Main)
                                }
                            })}
                        />
                    </div>
                </div>
                <img className="auth-screen-image" src={authImage} />
            </div>
        );
    }
    return (
        <div className="auth-screen-container">
            <h1>Main</h1>
        </div>
    )

    // return (
    //     <div className="auth-screen-container">

    //         <div className="auth-form-container">
    //             <div className="auth-top-text-container">
    //                 <p className="auth-text-huge">Welcome back</p>
    //                 <p className="auth-text-medium">Glad to see you! Please enter your details.</p>
    //             </div>

    //             <div className="auth-form-container">
    //                 <LoginInput
    //                     label="Login"
    //                     value={loginLogin}
    //                     type="text"
    //                     placeholder="Enter your login"
    //                     onChange={(e) => setLoginLogin(e.target.value)}
    //                 />
    //                 <LoginInput
    //                     label="Password"
    //                     value={loginPassword}
    //                     type="password"
    //                     placeholder="Enter your password"
    //                     onChange={(e) => setLoginPassword(e.target.value)}
    //                 />
    //                 <LoginContinue
    //                     value="Continue"
    //                     onClick={() => store.login(login, password).then((success) => {
    //                         if (success) {
    //                             changeState(ScreenState.Main)
    //                         }
    //                     })}
    //                 />
    //             </div>

    //         </div>

    //         <div className="auth-form-container">
    //             <div className="auth-top-text-container">
    //                 <p className="auth-text-huge">Create new account</p>
    //                 <p className="auth-text-medium">Glad to see you! Please enter your details.</p>
    //             </div>

    //             <div className="auth-form-container">
    //                 <LoginInput
    //                     label="Name"
    //                     value={name}
    //                     type="text"
    //                     placeholder="Enter your name"
    //                     onChange={(e) => setName(e.target.value)}
    //                 />
    //                 <LoginInput
    //                     label="Surname"
    //                     value={surname}
    //                     type="text"
    //                     placeholder="Enter your surname"
    //                     onChange={(e) => setSurname(e.target.value)}
    //                 />
    //                 <LoginInput
    //                     label="Nickname"
    //                     value={nickname}
    //                     type="text"
    //                     placeholder="Enter your nickname"
    //                     onChange={(e) => setNickname(e.target.value)}
    //                 />
    //                 <LoginInput
    //                     label="Login"
    //                     value={login}
    //                     type="text"
    //                     placeholder="Enter your login"
    //                     onChange={(e) => setLogin(e.target.value)}
    //                 />
    //                 <LoginInput
    //                     label="Password"
    //                     value={password}
    //                     type="password"
    //                     placeholder="Enter your password"
    //                     onChange={(e) => setPassword(e.target.value)}
    //                 />
    //                 <LoginContinue
    //                     value="Continue"
    //                     onClick={() => store.registration(name, surname, nickname, login, password)}
    //                 />
    //             </div>

    //         </div>


    //         <img className="auth-screen-image" src={authImage} />
    //     </div>
    // );
};

export default MainPage;
