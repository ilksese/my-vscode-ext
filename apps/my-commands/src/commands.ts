import * as vscode from 'vscode';
import { CommandExecutor, createShellAdapter, VariableResolver } from '@suite/core';
import type { CommandConfig, VariableContext } from '@suite/core';
import {
  FileStrategy,
  RelativeFileStrategy,
  FileBasenameStrategy,
  FileBasenameNoExtStrategy,
  FileDirnameStrategy,
  WorkspaceFolderStrategy,
  CwdStrategy,
} from '@suite/core';
import * as path from 'path';

let outputChannel: vscode.OutputChannel | null = null;

function getOutputChannel(): vscode.OutputChannel {
  if (!outputChannel) {
    outputChannel = vscode.window.createOutputChannel('My Commands');
  }
  return outputChannel;
}

export function registerCommandPalette(
  context: vscode.ExtensionContext,
  getCommands: () => CommandConfig[]
): vscode.Disposable {
  return vscode.commands.registerCommand('myCommands.runFromMenu', async () => {
    const commands = getCommands();
    if (commands.length === 0) {
      vscode.window.showInformationMessage(
        'No commands configured. Please add commands in the sidebar first.'
      );
      return;
    }

    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showWarningMessage('No active file. Open a file and try again.');
      return;
    }

    const quickPick = vscode.window.createQuickPick();
    quickPick.items = commands.map((cmd) => ({
      label: cmd.displayName,
      description: cmd.command,
    }));
    quickPick.placeholder = 'Select a command to run';

    quickPick.onDidAccept(async () => {
      const currentEditor = vscode.window.activeTextEditor;
      const selected = commands.find(
        (cmd) => cmd.displayName === quickPick.selectedItems[0]?.label
      );
      quickPick.hide();

      if (selected && currentEditor) {
        await executeCommand(context, selected, currentEditor.document.uri);
      }
    });

    quickPick.onDidHide(() => {
      quickPick.dispose();
    });

    quickPick.show();
  });
}

async function executeCommand(
  context: vscode.ExtensionContext,
  config: CommandConfig,
  fileUri: vscode.Uri
): Promise<void> {
  const workspaceFolder = vscode.workspace.getWorkspaceFolder(fileUri);
  const channel = getOutputChannel();
  channel.show();

  const variableContext: VariableContext = {
    fileAbsolutePath: fileUri.fsPath,
    workspaceRootPath: workspaceFolder?.uri.fsPath,
    cwd: computeCwd(config, workspaceFolder?.uri.fsPath, fileUri.fsPath),
  };

  const resolver = new VariableResolver();
  resolver.register(new FileStrategy());
  resolver.register(new RelativeFileStrategy());
  resolver.register(new FileBasenameStrategy());
  resolver.register(new FileBasenameNoExtStrategy());
  resolver.register(new FileDirnameStrategy());
  resolver.register(new WorkspaceFolderStrategy());
  resolver.register(new CwdStrategy());

  const shellAdapter = createShellAdapter();
  const executor = new CommandExecutor();

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: `Running: ${config.displayName}`,
      cancellable: true,
    },
    async (_progress, token) => {
      const abortController = new AbortController();
      const cancellationDisposable = token.onCancellationRequested(() => {
        abortController.abort();
      });

      try {
        return executor.execute({
          command: config.command,
          workingDirectory: variableContext.cwd,
          shellAdapter,
          variableResolver: resolver,
          variableContext,
          timeoutMs: 30000,
          signal: abortController.signal,
          onOutput: (event) => {
            channel.appendLine(event.message);
          },
        });
      } finally {
        cancellationDisposable.dispose();
      }
    }
  );
}

function computeCwd(
  config: CommandConfig,
  workspaceRoot?: string,
  fileAbsolutePath?: string
): string {
  switch (config.workingDir) {
    case 'workspaceRoot':
      return workspaceRoot || process.cwd();
    case 'fileDir':
      return fileAbsolutePath
        ? path.dirname(fileAbsolutePath)
        : process.cwd();
    case 'custom':
      return config.customWorkingDir || process.cwd();
    default:
      return process.cwd();
  }
}
