import { FC } from "react";
import authImage from "../assets/auth.png";
import { LoginForm } from "../components/auth/LoginForm";
import "../styles/css/Auth.css";

const LoginPage: FC = () => {
    return (
        <div className="auth-screen-container">
            <LoginForm
                successRedirectUrl="/x/"
            />
            <img className="auth-screen-image" src={authImage} />
        </div>
    );
};

export default LoginPage;
