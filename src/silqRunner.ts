'use strict';

import * as path from 'path';
import * as cp from 'child_process';
import ChildProcess = cp.ChildProcess;

import * as vscode from 'vscode';

export default class SilqRunner{
    private diagnosticCollection: vscode.DiagnosticCollection;
    private run(textDocument: vscode.TextDocument, doRun: boolean){
        let executable = 'silq'; // TODO: fix
        let args = ['--json', textDocument.fileName];
        if(doRun) args.push('--run');
        let options = vscode.workspace.rootPath ? { cwd: vscode.workspace.rootPath } : undefined;
        let childProcess = cp.spawn(executable, args, options);
        let output = '';
        let diagnostics: vscode.Diagnostic[] = [];
        if(childProcess.pid){
            childProcess.stdout.on('data',(data: Buffer) => {
                output += data;
            });
            childProcess.stdout.on('end', () => {
                JSON.parse(output).forEach(item => {
                    let range = new vscode.Range(item.start.line-1, item.start.column-1, item.end.line-1, item.end.column-1);
                    let message = item.message;
                    let severity = item.severity === "error" ? vscode.DiagnosticSeverity.Error :
                                   item.severity === "note" ? vscode.DiagnosticSeverity.Hint :
                                   vscode.DiagnosticSeverity.Warning;
                    let diagnostic = new vscode.Diagnostic(range,message,severity);
                    diagnostics.push(diagnostic)
                });
            })
            this.diagnosticCollection.set(textDocument.uri, diagnostics);
        }
    }
    activate(subscriptions: { dispose(): any; }[]) {
        throw new Error("Method not implemented.");
    }
}