import { FC, useContext, useState, useEffect, useRef, MouseEvent } from "react";
// import { Input, Output } from "../workers/python.wasm.worker"

import HorizontalSplitter from "../components/sandbox/HorizontalSplitter"

import { useResizable } from "react-resizable-layout";
import { useLocation } from 'react-router-dom';

import CodeMirror from '@uiw/react-codemirror';
// Extentions
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
// Themesfunction
import { vscodeDark } from '@uiw/codemirror-theme-vscode';

const SandboxPage = () => {
    const { state } = useLocation();
    const { text: inCode } = state; //

    const [stdOutput, setStdOutput] = useState<string>('')
    const [stdError, setStdError] = useState<string>('')
    const [code, setCode] = useState<string>(inCode)
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const runPythonCode = () => {
        if (isLoading) {
            return
        }
        setIsLoading(true)
        const pythonWorker = new Worker(new URL("../workers/python.wasm.worker.ts", import.meta.url));
        pythonWorker.postMessage(code)
        pythonWorker.onmessage = (event: any) => {
            console.log("EVENT", event)
            const { stdout, stderr } = event.data
            setStdOutput(stdout)
            setStdError(stderr)
            setIsLoading(false)
        }
    }

    const {
        isDragging: isSplitterDragging,
        position: splitterH,
        separatorProps: separatorProps
    } = useResizable({
        axis: "y",
        initial: 150,
        reverse: true
    });

    return <div className="page-container">
        <div className="top-container">
            <CodeMirror
                value={code}
                width={"100%"}
                height={"100%"}
                theme={vscodeDark}
                onChange={(value: string) => { setCode(value) }}
                extensions={[python(), javascript()]}
                editable={true}
            />
        </div>
        <div
            style={{ background: "rgb(30, 30, 30)" }}
        >
            <button
                className="run-button"
                onClick={runPythonCode}>
                {isLoading ? "Loading..." : "Run"}
            </button>
        </div>
        <HorizontalSplitter
            isDragging={isSplitterDragging}
            {...separatorProps}
        />
        <div
            className="bottom-container"
            style={{ height: splitterH }}>
            <div>

            </div>
            <div style={{ color: "white" }}>
                {stdOutput.split('\n').map((line, index) => (
                    <p key={index} className="output-style">{line}</p>
                ))}
            </div>
            <div style={{ color: "red" }}>
                {stdError.split('\n').map((line, index) => (
                    <p key={index} className="output-style">{line}</p>
                ))}
            </div>
        </div>
    </div >
}



export default SandboxPage;
