import * as vscode from 'vscode';
import SilqRunner from './silqRunner';

export function activate(context: vscode.ExtensionContext) {
	let runner = new SilqRunner();	
	runner.activate(context.subscriptions);
}