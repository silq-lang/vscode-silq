'use strict';

import * as path from 'path';
import * as cp from 'child_process';
import ChildProcess = cp.ChildProcess;

import * as vscode from 'vscode';
import { stringify } from 'querystring';

const outputChannel = vscode.window.createOutputChannel("Silq Output");
export default class SilqRunner{
    private diagnosticCollection!: vscode.DiagnosticCollection;
    private outputChannel!: vscode.OutputChannel;
    activate(subscriptions: { dispose(): any; }[]) {
        subscriptions.push(this);
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection(); 
        vscode.workspace.onDidOpenTextDocument(this.checkAll, this, subscriptions);
        vscode.workspace.onDidSaveTextDocument(this.checkAll, this);
        // vscode.workspace.onDidChangeTextDocument(this.checkEvent, this, subscriptions); // TODO
        vscode.workspace.onDidCloseTextDocument((textDocument) => {
                this.diagnosticCollection.delete(textDocument.uri);
        }, null, subscriptions);
        // type check all open documents
        this.checkAll();
    }
    private checkAll(changed?: vscode.TextDocument|undefined){
        vscode.workspace.textDocuments.forEach((textDocument: vscode.TextDocument)=>{
            if(changed && textDocument.uri.toString() == changed.uri.toString()) return this.run(textDocument);
            else return this.check(textDocument);
        }, this);
    }
    private check(textDocument: vscode.TextDocument){
        if(textDocument.languageId !== 'silq') return;
        this.perform(textDocument, false);
    }
    private run(textDocument: vscode.TextDocument){
        if(textDocument.languageId !== 'silq') return;
        this.perform(textDocument, true);
    }
    private log(msg: string){
        vscode.window.showInformationMessage(msg);
        console.log(msg);
    }
    private perform(textDocument: vscode.TextDocument, doRun: boolean){
        //this.log("checking: "+textDocument.fileName);
        let executable = vscode.workspace.getConfiguration("silq").get<string>("binaryPath");
        if(executable === null){
            this.log("Error: unable to read silq.binaryPath setting.")
            return;
        }
        let args = ['--error-json', textDocument.fileName];
        if(doRun) args.push('--run');
        let options = { cwd: path.dirname(textDocument.fileName) };
        let childProcess = cp.spawn(executable as string, args, options);
        let output = '';
        let diagnostics: vscode.Diagnostic[] = [];
        if(childProcess.pid){
            childProcess.stderr.on('data',(data: Buffer) => {
                output += data;
            });
            childProcess.stderr.on('end', async() => {
                JSON.parse(output).map((item:any):vscode.Diagnostic|null => {
                    let source = item.source as string;
                    let uri=vscode.Uri.file(source);
                    if(uri.toString()!=textDocument.uri.toString()) return null; // TODO: ok?
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
                    return diagnostic;
                }).forEach((diagnostic: vscode.Diagnostic|null) => {
                    if(diagnostic === null) return;
                    outputChannel.clear();
                    diagnostics.push(diagnostic);
                });
                this.diagnosticCollection.set(textDocument.uri, diagnostics);
                if(doRun && diagnostics.length===0){
                    outputChannel.clear();
                    outputChannel.appendLine("running..."); // TODO
                    let first = true;
                    childProcess.stdout.on('data',(data: Buffer) => {
                        if(first){
                            outputChannel.clear();
                            outputChannel.show(true);
                            first = false;
                        }
                        outputChannel.append(data.toString());
                    });
                    childProcess.stdout.on('end',()=>{
                        if(first){
                            outputChannel.clear();
                            first = false;
                        }
                    });
                }
            });
        }else this.log("Error: unable to run silq. You may need to set silq.binaryPath.");
    }
    public dispose(): void {
        this.diagnosticCollection.clear();
        this.diagnosticCollection.dispose();
    }
}
