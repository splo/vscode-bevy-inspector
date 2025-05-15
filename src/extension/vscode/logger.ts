import * as vscode from 'vscode';

export const logger = vscode.window.createOutputChannel('Bevy Inspector', { log: true });
