import type * as vscode from 'vscode';
import { BevyInspectorExtension } from './bevyInspectorExtension';

export function activate(context: vscode.ExtensionContext) {
  new BevyInspectorExtension(context);
}
