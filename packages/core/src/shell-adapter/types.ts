export interface ShellAdapter {
  escapePath(path: string): string;
  getShell(): string;
  getShellArgs(): string[];
  normalizePath(path: string): string;
}
