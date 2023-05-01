import { FC } from "react";
import "../../styles/css/Auth.css";


interface LoginContinueProps {
    value: string;
    onClick: () => void;
}


export const ContinueButton: FC<LoginContinueProps> = ({ value, onClick }) => {
    return (
        <div className="auth-input-wrapper">
            <button name="auth-continue" onClick={onClick}>{value}</button>
        </div>
    );
};
