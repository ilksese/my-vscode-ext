import * as vscode from 'vscode';
import { SidebarMessageBus, type WebviewMessage } from './message-bus';

export class SidebarProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'myCommandsSidebar';

  private view?: vscode.WebviewView;
  public messageBus: SidebarMessageBus;

  constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly extensionUri: vscode.Uri
  ) {
    this.messageBus = new SidebarMessageBus(context, 'myCommands.config');
  }

  async resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ): Promise<void> {
    this.view = webviewView;
    
    const webviewPath = vscode.Uri.joinPath(this.extensionUri, 'dist', 'webview');
    
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [webviewPath],
    };

    const htmlPath = vscode.Uri.joinPath(webviewPath, 'index.html');
    const htmlBytes = await vscode.workspace.fs.readFile(htmlPath);
    let htmlContent = new TextDecoder().decode(htmlBytes);

    // 转换资源路径为 webview 可访问的 URI
    const baseUri = webviewView.webview.asWebviewUri(webviewPath);
    htmlContent = htmlContent
      .replace(/src="\.\//g, `src="${baseUri}/`)
      .replace(/href="\.\//g, `href="${baseUri}/`);

    webviewView.webview.html = htmlContent;

    webviewView.webview.onDidReceiveMessage((message: unknown) => {
      if (typeof message === 'object' && message !== null && 'type' in message) {
        this.messageBus.handleMessage(message as WebviewMessage);
      }
    });

    webviewView.onDidDispose(() => {
      this.messageBus.dispose();
    });

    this.messageBus.setWebview(webviewView);
    this.messageBus.sendCommandsList();
  }

  public refresh(): void {
    this.messageBus.sendCommandsList();
  }
}