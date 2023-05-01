import { FC } from "react";
import authImage from "../assets/auth.png";
import RegistrationForm from "../components/auth/RegistrationForm";
import "../styles/css/Auth.css";

const RegistrationPage: FC = () => {
    return (
        <div className="auth-screen-container">
            <RegistrationForm />
            <img className="auth-screen-image" src={authImage} />
        </div>
    );
};

export default RegistrationPage;
