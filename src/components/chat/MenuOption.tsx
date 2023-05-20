import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import classnames from 'classnames';


interface IProps {
    title: string
    active: boolean
    onClick: () => void
}


export const MenuOption: React.FC<IProps> = ({ title, active, onClick }) => {
    const navigate = useNavigate();
    const [isHoveredButton, setIsHoveredButton] = useState<boolean>(false);

    const handleMouseEnterCopy = () => {
        setIsHoveredButton(true);
    };
    const handleMouseLeaveCopy = () => {
        setIsHoveredButton(false);
    };

    const copyCodeDivStyle = {
        cursor: 'default',
        background: active ? '#E0E8FF' : '#F4F4F5',
        color: active ? '#6366F1' : '#71717A',
        borderRadius: '20px',
        padding: '2px 8px 2px 8px',
        fontSize: '14px',
        ...(isHoveredButton && {
            cursor: 'pointer',
        }),
    } as React.CSSProperties;

    return (
        <span
            onClick={onClick}
            style={copyCodeDivStyle}
            onMouseEnter={handleMouseEnterCopy}
            onMouseLeave={handleMouseLeaveCopy} >
            {title}
        </span >
    );
};
