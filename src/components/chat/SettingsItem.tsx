import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import classnames from 'classnames';


interface IProps {
    id: number
    title: string
    text: string
    onClick: () => void
}


export const SettingsItem: React.FC<IProps> = ({ id, title, text, onClick }) => {
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
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'row',
        gap: '12px',
        ...(isHoveredButton && {
            cursor: 'pointer',
        }),
    } as React.CSSProperties;

    const isTextLink = text.startsWith('http')

    return (
        <div
            style={copyCodeDivStyle}
            key={`link_${id}`}
            onClick={onClick}
        >

            <span style={
                {

                    background: '#F7F7F7', fontSize: '24px', color: '#3730A3',
                    width: '52px', height: '52px', display: 'flex', justifyContent: 'center',
                    alignItems: 'center', fontWeight: 'bold', borderRadius: '12px',
                    boxSizing: 'border-box',
                    padding: '22px'
                }
            }>
                {title[0].toUpperCase()}
            </span>
            <div style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ color: '#18181B', fontSize: '14px' }}>{title}</span>
                {isTextLink && <a
                    onMouseEnter={handleMouseEnterCopy}
                    onMouseLeave={handleMouseLeaveCopy}
                    href={text}
                    style={{
                        color: '#6366F1', fontSize: '14px', whiteSpace: 'nowrap',
                        overflow: 'hidden', textOverflow: 'ellipsis',
                        display: 'flex'
                    }}
                >{text}</a>}
                {!isTextLink && <span
                    onMouseEnter={handleMouseEnterCopy}
                    onMouseLeave={handleMouseLeaveCopy}
                    style={{
                        fontSize: '14px', whiteSpace: 'nowrap',
                        overflow: 'hidden', textOverflow: 'ellipsis',
                        display: 'flex'
                    }}
                >{text}</span>}
            </div>
        </div>
    );
};
