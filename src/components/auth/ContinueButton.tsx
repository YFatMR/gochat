import { FC } from "react";
import "../../styles/css/Auth.css";


interface LoginContinueProps {
    isLoading: boolean;
    value: string;
    onClick: () => void;
}


export const ContinueButton: FC<LoginContinueProps> = ({ isLoading, value, onClick }) => {
    return (
        <div className="auth-input-wrapper">
            <button name="auth-continue" onClick={onClick}>{isLoading ? 'is loading...' : value}</button>
        </div>
    );
};
