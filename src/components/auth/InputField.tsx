import React, { FC } from "react";
import "../../styles/css/Auth.css";


interface LoginInputProps {
    label: string;
    value: string;
    type: string;
    placeholder: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}


export const InputField: FC<LoginInputProps> = ({ label, value, type, placeholder, onChange }) => {
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
