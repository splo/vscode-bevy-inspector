import * as vscode from 'vscode';

const DEFAULT_POLLING_DELAY = 1000;

export class PollingService {
  polling: NodeJS.Timeout | undefined;

  enabled(): boolean {
    return this.polling !== undefined;
  }

  disablePolling() {
    vscode.commands.executeCommand('setContext', 'bevyInspector.pollingEnabled', false);
    clearInterval(this.polling);
    this.polling = undefined;
    console.debug('Polling disabled');
  }

  enablePolling() {
    vscode.commands.executeCommand('setContext', 'bevyInspector.pollingEnabled', true);
    const delay = vscode.workspace.getConfiguration('bevyInspector').get('pollingDelay', DEFAULT_POLLING_DELAY);
    this.polling = setInterval(() => vscode.commands.executeCommand('bevyInspector.refresh'), delay);
    console.debug('Polling enabled');
  }

  restart() {
    if (this.enabled()) {
      this.disablePolling();
      this.enablePolling();
    }
  }
}
