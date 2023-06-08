import { useLocation } from 'react-router-dom';

import CodeMirror from '@uiw/react-codemirror';
// Themesfunction
import { vscodeDark } from '@uiw/codemirror-theme-vscode';

export const InstructionPage = () => {
    const { state } = useLocation();
    const { title, text } = state;

    const titleStyle = {
        display: 'flex',
        marginLeft: '38px',
        height: ''
    } as React.CSSProperties;

    const divStyle = {
        display: 'flex',
        width: '100%',
        height: '100vh',
        flexDirection: 'column',
    } as React.CSSProperties;

    const urlRegex = /((https?|ftp):\/\/[^\s/$.?#].[^\s]*)/gi;
    const innerText = text.replace(urlRegex, (url: any) => {
        return `<a href="${url}" target="_blank" title="${url}">${url}</a>`;
    });

    return (
        <div style={divStyle}>
            <h1 style={titleStyle}>{title}</h1>
            <CodeMirror
                value={text}
                width={"100%"}
                height={"calc(100vh - 82px)"}
                // theme={vscodeDark}
                editable={false}
            // minHeight={'100vh'}
            // maxHeight={'100vh'}
            />
        </div>
    )
}