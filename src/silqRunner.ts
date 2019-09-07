'use strict';

import * as path from 'path';
import * as cp from 'child_process';
import ChildProcess = cp.ChildProcess;

import * as vscode from 'vscode';
import { stringify } from 'querystring';

export default class SilqRunner{
    private diagnosticCollection!: vscode.DiagnosticCollection;
    activate(subscriptions: { dispose(): any; }[]) {
        subscriptions.push(this);
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection();
        vscode.workspace.onDidOpenTextDocument(this.check, this, subscriptions);
        vscode.workspace.onDidCloseTextDocument((textDocument)=> {
                this.diagnosticCollection.delete(textDocument.uri);
        }, null, subscriptions);

        vscode.workspace.onDidSaveTextDocument(this.check, this);

        // type check all open documents
        vscode.workspace.textDocuments.forEach(this.check, this);
    }
    private check(textDocument: vscode.TextDocument){
        this.perform(textDocument, true)
    }
    private log(msg: string){
        vscode.window.showInformationMessage(msg);
    }
    private perform(textDocument: vscode.TextDocument, doRun: boolean){
        if(textDocument.languageId !== 'silq') return;
        this.log("checking: "+textDocument.fileName+" "+textDocument.languageId)
        let executable = '/home/tgehr/eth/phd/projects/qPL/silq/silq'; // TODO: fix
        let args = ['--error-json', textDocument.fileName];
        if(doRun) args.push('--run');
        let options = undefined;
        let childProcess = cp.spawn(executable, args, options);
        let output = '';
        let diagnostics: vscode.Diagnostic[] = [];
        if(childProcess.pid){
            childProcess.stderr.on('data',(data: Buffer) => {
                output += data;
            });
            childProcess.stderr.on('end', () => {
                JSON.parse(output).forEach((item:any) => {
                    let source = item.source as string;
                    let range = new vscode.Range(item.start.line-1, item.start.column, item.end.line-1, item.end.column);
                    let message = item.message as string;
                    let severity = item.severity === "error" ? vscode.DiagnosticSeverity.Error :
                                   item.severity === "note" ? vscode.DiagnosticSeverity.Hint :
                                   vscode.DiagnosticSeverity.Warning;
                    let diagnostic = new vscode.Diagnostic(range,message,severity);
                    diagnostic.relatedInformation = item.relatedInformation.map((ritem:any)=>{
                        let source = ritem.source as string;
                        let range = new vscode.Range(ritem.start.line-1, ritem.start.column, ritem.end.line-1, ritem.end.column);
                        let message = ritem.message as string;
                        return new vscode.DiagnosticRelatedInformation(new vscode.Location(textDocument.uri, range), message);
                    });
                    diagnostics.push(diagnostic)
                });
                this.diagnosticCollection.set(textDocument.uri, diagnostics);
            })
        }else this.log("error: could not execute silq");
    }
    public dispose(): void {
        this.diagnosticCollection.clear();
        this.diagnosticCollection.dispose();
    }
}
