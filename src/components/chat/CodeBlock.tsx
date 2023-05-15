import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { coy, atomDark, tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
// import Editor from '@monaco-editor/react';

// Images
import copyCodeIcon from "../../assets/copyCode.png"

export type Languages = "javascript" | "python" | "go";

interface CodeBlockProps {
    language: Languages
    code: string
}


export const CodeBlock: React.FC<CodeBlockProps> = ({ language, code }) => {
    const lineNumberStyle = {
        minWidth: '22px',
        paddingRight: '8px',
        fontSize: '12px',
    } as React.CSSProperties;

    const [isHovered, setIsHovered] = useState<boolean>(false);

    const handleMouseEnter = () => {
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
    };

    const divStyle = {
        display: 'flex',
        justifyContent: 'center',
        margin: '8px 16px 8px 8px',
        cursor: 'default',
        ...(isHovered && {
            display: 'flex',
            justifyContent: 'center',
            margin: '8px 16px 8px 8px',
            cursor: 'pointer',
        }),
    } as React.CSSProperties;


    return (
        <>
            <div className='message-code-header'>
                <span style={{ marginLeft: '16px' }}>{language}</span>
                <div
                    onClick={() => { navigator.clipboard.writeText(code) }}
                    style={divStyle}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}>
                    <img src={copyCodeIcon} style={{ width: 'auto', height: '16px', marginRight: '8px' }} />
                    <span>Copy code</span>
                </div>
            </div>
            <div className='message-code'>
                <SyntaxHighlighter
                    language={language}
                    style={tomorrow}
                    wrapLines={true}
                    useInlineStyles={true}
                    lineNumberStyle={lineNumberStyle}
                    // lineNumberContainerStyle={{}}
                    showLineNumbers={true}>
                    {code}
                </SyntaxHighlighter>
            </div>
        </>
    );
};
