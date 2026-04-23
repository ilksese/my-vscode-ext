import * as vscode from 'vscode';
import type { CommandConfig } from '@suite/core';

export type WebviewMessage =
  | { type: 'GET_COMMANDS' }
  | { type: 'SAVE_COMMAND'; payload: CommandConfig }
  | { type: 'DELETE_COMMAND'; payload: { id: string } };

export type VscodeMessage =
  | { type: 'COMMANDS_LIST'; payload: CommandConfig[] }
  | { type: 'COMMAND_SAVED'; payload: CommandConfig }
  | { type: 'COMMAND_DELETED'; payload: { id: string } }
  | { type: 'ERROR'; payload: { message: string } };

export class SidebarMessageBus {
  private webviewPanel: vscode.WebviewView | null = null;
  private storageKey: string;
  private context: vscode.ExtensionContext;

  constructor(context: vscode.ExtensionContext, storageKey: string) {
    this.context = context;
    this.storageKey = storageKey;
  }

  setWebview(webview: vscode.WebviewView): void {
    this.webviewPanel = webview;
  }

  getCommands(): CommandConfig[] {
    return this.context.globalState.get<CommandConfig[]>(this.storageKey, []);
  }

  async saveCommand(config: CommandConfig): Promise<void> {
    const commands = this.getCommands();
    const index = commands.findIndex((c) => c.id === config.id);

    if (index >= 0) {
      commands[index] = config;
    } else {
      commands.push(config);
    }

    await this.context.globalState.update(this.storageKey, commands);
    this.postMessage({ type: 'COMMAND_SAVED', payload: config });
  }

  async deleteCommand(id: string): Promise<void> {
    const commands = this.getCommands().filter((c) => c.id !== id);
    await this.context.globalState.update(this.storageKey, commands);
    this.postMessage({ type: 'COMMAND_DELETED', payload: { id } });
  }

  sendCommandsList(): void {
    this.postMessage({ type: 'COMMANDS_LIST', payload: this.getCommands() });
  }

  handleMessage(message: WebviewMessage): void {
    switch (message.type) {
      case 'GET_COMMANDS':
        this.sendCommandsList();
        break;
      case 'SAVE_COMMAND':
        this.saveCommand(message.payload).catch((err) =>
          this.postMessage({ type: 'ERROR', payload: { message: err.message } })
        );
        break;
      case 'DELETE_COMMAND':
        this.deleteCommand(message.payload.id).catch((err) =>
          this.postMessage({ type: 'ERROR', payload: { message: err.message } })
        );
        break;
    }
  }

  private postMessage(message: VscodeMessage): void {
    if (this.webviewPanel) {
      this.webviewPanel.webview.postMessage(message);
    }
  }
}
