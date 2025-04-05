import type * as vscode from 'vscode';
import { BevyInspectorExtension } from './infrastructure/vscode/bevyInspectorExtension';

export function activate(context: vscode.ExtensionContext) {
  new BevyInspectorExtension(context);
}
