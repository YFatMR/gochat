import React, { FC } from "react";

import "../../assets/css/LoginFormInput.css";

interface LoginInputProps {
    label: string;
    value: string;
    type: string;
    placeholder: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const LoginInput: FC<LoginInputProps> = ({ label, value, type, placeholder, onChange }) => {
    return (
        <div className="auth-input-wrapper">
            <label htmlFor="auth-input">{label}</label>
            <input
                name="auth-input"
                onChange={onChange}
                value={value}
                type={type}
                placeholder={placeholder}
            />
        </div>
    );
};

interface LoginContinueProps {
    value: string;
    onClick: () => void;
}

export const LoginContinue: FC<LoginContinueProps> = ({ value, onClick }) => {
    return (
        <div className="auth-input-wrapper">
            <button name="auth-continue" onClick={onClick}>{value}</button>
        </div>
    );
};
