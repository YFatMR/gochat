import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";

// Images
import copyCodeIcon from "../../assets/copyTest.png"



interface IProps {
    title: string
    text: string
    url: string
}


export const PersonInfoOption: React.FC<IProps> = ({ title, text, url = "" }) => {
    const navigate = useNavigate();
    const [isHoveredCopyOption, setIsHoveredCopyOption] = useState<boolean>(false);

    const handleMouseEnterCopy = () => {
        setIsHoveredCopyOption(true);
    };
    const handleMouseLeaveCopy = () => {
        setIsHoveredCopyOption(false);
    };

    const copyCodeDivStyle = {
        cursor: 'default',
        ...(isHoveredCopyOption && {
            cursor: 'pointer',
        }),
    } as React.CSSProperties;

    return (
        <div>
            <span style={{ fontSize: '14px' }}>{title}</span>
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: '22px' }}>
                {
                    url.length > 0 ? <a style={{ color: '#6366F1', fontSize: '16px' }} href={url}>{text}</a> :
                        <span style={{ color: '#6366F1', fontSize: '16px' }}>{text}</span>
                }

                <div
                    onClick={() => { navigator.clipboard.writeText(text) }}
                    style={copyCodeDivStyle}
                    onMouseEnter={handleMouseEnterCopy}
                    onMouseLeave={handleMouseLeaveCopy}>
                    <img src={copyCodeIcon} style={{ width: 'auto', height: '16px', marginRight: '8px' }} />
                </div>
            </div>
        </div>
    );
};
