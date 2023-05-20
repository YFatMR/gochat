import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { coy, atomDark, tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
// import Editor from '@monaco-editor/react';
// import { Codemirror } from 'react-codemirror-ts';
// import 'codemirror/lib/codemirror.css';
// import 'codemirror/mode/javascript/javascript';
// import 'codemirror/mode/python/python';
// import 'codemirror/addon/edit/matchbrackets';

import { useNavigate } from "react-router-dom";

import CodeMirror from '@uiw/react-codemirror';
// Extentions
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
// Themes
import { vscodeDark } from '@uiw/codemirror-theme-vscode';


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

    const navigate = useNavigate();

    const [isHoveredCopyCode, setIsHoveredCopyCode] = useState<boolean>(false);
    const [isHoveredSandboxLink, setIsHoveredSandboxLink] = useState<boolean>(false);

    const handleMouseEnterCopyCode = () => {
        setIsHoveredCopyCode(true);
    };
    const handleMouseLeaveCopyCode = () => {
        setIsHoveredCopyCode(false);
    };

    const handleMouseEnterSandboxLink = () => {
        setIsHoveredSandboxLink(true);
    };
    const handleMouseLeaveSandboxLink = () => {
        setIsHoveredSandboxLink(false);
    };

    const copyCodeDivStyle = {
        display: 'flex',
        justifyContent: 'center',
        margin: '8px 16px 8px 8px',
        cursor: 'default',
        ...(isHoveredCopyCode && {
            display: 'flex',
            justifyContent: 'center',
            margin: '8px 16px 8px 8px',
            cursor: 'pointer',
        }),
    } as React.CSSProperties;

    const sandboxLinkSpanStyle = {
        cursor: 'default',
        display: 'flex',
        marginLeft: '16px',
        ...(isHoveredSandboxLink && {
            cursor: 'pointer',
            display: 'flex',
            marginLeft: '16px',
        }),
    } as React.CSSProperties;


    return (
        <>
            <div className='message-code-header'>
                <span
                    style={sandboxLinkSpanStyle}
                    onMouseEnter={handleMouseEnterSandboxLink}
                    onMouseLeave={handleMouseLeaveSandboxLink}
                    onClick={() => {
                        navigate(`/s`, { state: { text: code } })
                    }}
                >sandbox:{language}</span>
                <div
                    onClick={() => { navigator.clipboard.writeText(code) }}
                    style={copyCodeDivStyle}
                    onMouseEnter={handleMouseEnterCopyCode}
                    onMouseLeave={handleMouseLeaveCopyCode}>
                    <img src={copyCodeIcon} style={{ width: 'auto', height: '16px', marginRight: '8px' }} />
                    <span>Copy code</span>
                </div>
            </div>
            <div className='message-code'>
                <CodeMirror
                    value={code}
                    maxWidth={"500px"}
                    maxHeight={"300px"}
                    theme={vscodeDark}
                    // name="example"
                    extensions={[python(), javascript()]}
                    editable={false}
                />
            </div>
        </>
    );
};
