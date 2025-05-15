import * as vscode from 'vscode';

export const DEFAULT_POLLING_DELAY = 1000;

export class PollingService {
  private timeout: NodeJS.Timeout | undefined;
  private delay: number = DEFAULT_POLLING_DELAY;
  private readonly refreshEmitter = new vscode.EventEmitter<void>();
  public readonly onRefresh = this.refreshEmitter.event;

  public enabled(): boolean {
    return this.timeout !== undefined;
  }

  public setDelay(delay: number) {
    this.delay = delay;
    if (this.enabled()) {
      this.disablePolling();
      this.enablePolling();
    }
  }

  public disablePolling() {
    clearInterval(this.timeout);
    this.timeout = undefined;
  }

  public enablePolling() {
    this.disablePolling();
    this.timeout = setInterval(() => this.refreshEmitter.fire(), this.delay);
  }
}
