import * as vscode from 'vscode';

// Stub - will be replaced by Task 6
export class SidebarProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'myCommandsSidebar';
  public messageBus = { getCommands: () => [] as any[] };

  constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly extensionUri: vscode.Uri
  ) {}

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ): void | Thenable<void> {}
}
