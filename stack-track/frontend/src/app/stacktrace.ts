
export class StackTrace {
    CHROME_IE_STACK_REGEXP = /^\s*at .*(\S+\:\d+|\(native\))/m;
    chrome = /^\s*at (?:(.*?) ?\()?((?:file|https?|blob|chrome-extension|native|eval|webpack|<anonymous>|[-a-z]+:|\/).*?)(?::(\d+))?(?::(\d+))?\)?\s*$/i;
    chromeEval = /\((\S*)(?::(\d+))(?::(\d+))\)/;
    UNKNOWN_FUNCTION = '?';

    parse(exception: Error): IComputedStackTrace | Error {
        try {
            let stackArr = this.computeStackTraceFromStackProp(exception);
            return {
                message: this.extractMessage(exception),
                name: exception.name,
                stack: stackArr,
            };

        } catch (error) {
            return new Error('Cannot parse given Error object');
        }
    }
    /**
     * Given an Error object, extract the most information from it.
     *
     * @param {Error} error object
     * @return {Array} of IStackFrame
     */
    computeStackTraceFromStackProp(ex: Error): IStackFrame[] | null {
        if (!ex || !ex.stack) {
            return null;
        }
        let stack: IStackFrame[] = [];
        let lines = ex.stack.split('\n');
        let isEval: boolean;
        let submatch;
        let parts;
        let element;
        for (let i = 0; i < lines.length; ++i) {
            if ((parts = this.chrome.exec(lines[i]))) {
                let isNative = parts[2] && parts[2].indexOf('native') === 0; // start of line
                isEval = parts[2] && parts[2].indexOf('eval') === 0; // start of line
                if (isEval && (submatch = this.chromeEval.exec(parts[2]))) {
                    // throw out eval line/column and use top-most line/column number
                    parts[2] = submatch[1]; // url
                    parts[3] = submatch[2]; // line
                    parts[4] = submatch[3]; // column
                }
                element = new StackFrame({
                    url: parts[2],
                    func: parts[1] || this.UNKNOWN_FUNCTION,
                    args: isNative ? [parts[2]] : [],
                    line: parts[3] ? +parts[3] : null,
                    column: parts[4] ? +parts[4] : null,
                });
            } else {
                continue;
            }
            if (!element.func && element.line) {
                element.func = this.UNKNOWN_FUNCTION;
            }
            stack.push(element);
        }
        if (!stack.length) {
            return null;
        }
        return stack;
    }
    extractMessage(ex) {
        const message = ex && ex.message;
        if (!message) {
            return 'No error message';
        }
        if (message.error && typeof message.error.message === 'string') {
            return message.error.message;
        }
        return message;
    }
}
export class IComputedStackTrace {
    message: string;
    name: string;
    stack: IStackFrame[];
}

export interface IStackFrame {
    args?: any;
    column?: number;
    line?: number;
    func?: string;
    url?: string;
}
export class StackFrame implements IStackFrame {
    args: any;
    column: number;
    line: number;
    func: string;
    url: string;
    constructor(obj: IStackFrame) {
        this.args = obj.args;
        this.column = obj.column;
        this.line = obj.line;
        this.func = obj.func;
        this.url = obj.url;
    }
}