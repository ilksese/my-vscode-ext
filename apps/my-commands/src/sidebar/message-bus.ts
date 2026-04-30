import * as vscode from 'vscode';
import type { CommandConfig } from '@suite/core';

export type WebviewMessage =
  | { type: 'GET_COMMANDS' }
  | { type: 'SAVE_COMMAND'; payload: CommandConfig }
  | { type: 'DELETE_COMMAND'; payload: { id: string } }
  | { type: 'RUN_COMMAND'; payload: { id: string } };

export type VscodeMessage =
  | { type: 'COMMANDS_LIST'; payload: CommandConfig[] }
  | { type: 'COMMAND_SAVED'; payload: CommandConfig }
  | { type: 'COMMAND_DELETED'; payload: { id: string } }
  | { type: 'ERROR'; payload: { message: string } };

export class SidebarMessageBus {
  private webviewView: vscode.WebviewView | null = null;
  private storageKey: string;
  private context: vscode.ExtensionContext;
  private runHandler?: (config: CommandConfig) => Promise<void>;

  constructor(context: vscode.ExtensionContext, storageKey: string) {
    this.context = context;
    this.storageKey = storageKey;
  }

  setRunHandler(handler: (config: CommandConfig) => Promise<void>): void {
    this.runHandler = handler;
  }

  setWebview(webview: vscode.WebviewView): void {
    this.webviewView = webview;
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
      case 'RUN_COMMAND':
        this.runCommand(message.payload.id).catch((err) =>
          this.postMessage({ type: 'ERROR', payload: { message: err.message } })
        );
        break;
    }
  }

  async runCommand(id: string): Promise<void> {
    const commands = this.getCommands();
    const target = commands.find((c) => c.id === id);
    if (!target) {
      this.postMessage({ type: 'ERROR', payload: { message: `Command ${id} not found` } });
      return;
    }
    if (!this.runHandler) {
      this.postMessage({ type: 'ERROR', payload: { message: 'No run handler registered' } });
      return;
    }
    await this.runHandler(target);
  }

  dispose(): void {
    this.webviewView = null;
  }

  private postMessage(message: VscodeMessage): void {
    if (this.webviewView) {
      this.webviewView.webview.postMessage(message);
    }
  }
}
