/* eslint-disable */

// import { useEffect, useState } from 'react';
// import { loadPythonWasm, runPythonCode } from './python.wasm';
// import { loadPyodide } from 'pyodide';
// import { loadPyodide } from '@pyodide/pyodide/dist/pyodide;
import { loadPyodide } from 'pyodide';
import _ from "lodash";

const ctx: Worker = self as any

export interface Input {
    code: string
}

export interface Output {
    stdout: string
    stderr: string
}

const ExecutePythonCode = async ({ code }: Input): Promise<Output> => {
    let stdout = ""
    let stderr = ""
    let pyodide = await loadPyodide({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.23.2/full/",
        // stdin: window.prompt,
        stdout: (text) => { stdout += text + "\n"; },
        stderr: (text) => { stderr += text + "\n"; }
    });
    try {
        pyodide.runPython(code)
    } catch (error: any) {
        return {
            stdout: stdout,
            stderr: error.message,
        }
    }
    return {
        stdout: stdout,
        stderr: stderr,
    }
}

ctx.addEventListener("message", async (event) => {
    console.log(event)
    const code: string = event.data
    if (code.length <= 0) {
        return
    }
    postMessage(await ExecutePythonCode({ code: code }))
})
