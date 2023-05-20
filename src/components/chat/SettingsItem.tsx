import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import classnames from 'classnames';


interface IProps {
    id: number
    text: string
}


export const SettingsItem: React.FC<IProps> = ({ id, text }) => {
    const navigate = useNavigate();
    const [isHoveredButton, setIsHoveredButton] = useState<boolean>(false);

    const handleMouseEnterCopy = () => {
        setIsHoveredButton(true);
    };
    const handleMouseLeaveCopy = () => {
        setIsHoveredButton(false);
    };
    const title = (new URL(text)).hostname

    const copyCodeDivStyle = {
        cursor: 'default',
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'row',
        gap: '12px',
        ...(isHoveredButton && {
            cursor: 'pointer',
        }),
    } as React.CSSProperties;

    return (
        <div
            style={copyCodeDivStyle}
            key={`link_${id}`}
        >

            <span style={
                {
                    background: '#F7F7F7', fontSize: '24px', color: '#3730A3',
                    width: '52px', height: '52px', display: 'flex', justifyContent: 'center',
                    alignItems: 'center', fontWeight: 'bold', borderRadius: '12px',
                }
            }>
                {title[0].toUpperCase()}
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <a style={{ color: '#18181B', fontSize: '14px' }}>{title}</a>
                <a onMouseEnter={handleMouseEnterCopy} onMouseLeave={handleMouseLeaveCopy} href={text} style={{ color: '#6366F1', fontSize: '14px' }}>{text}</a>
            </div>
        </div>
    );
};
