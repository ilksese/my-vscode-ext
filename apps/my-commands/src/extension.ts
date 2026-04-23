import * as vscode from 'vscode';
import { registerCommandPalette } from './commands';
import { SidebarProvider } from './sidebar/sidebar-provider';
import type { CommandConfig } from '@suite/core';

export function activate(context: vscode.ExtensionContext): void {
  const sidebarProvider = new SidebarProvider(context, context.extensionUri);

  const getCommands = (): CommandConfig[] => {
    return sidebarProvider.messageBus.getCommands();
  };

  const commandDisposable = registerCommandPalette(context, getCommands);

  const viewDisposable = vscode.window.registerWebviewViewProvider(
    SidebarProvider.viewType,
    sidebarProvider
  );

  context.subscriptions.push(commandDisposable);
  context.subscriptions.push(viewDisposable);
}

export function deactivate(): void {}
