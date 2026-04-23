import type { ShellAdapter } from './types';

export class UnixShellAdapter implements ShellAdapter {
  escapePath(p: string): string {
    if (p.includes(' ') || p.includes("'")) {
      return `'${p.replace(/'/g, "'\\''")}'`;
    }
    return p;
  }

  escapeCommand(command: string): string {
    return "'" + command.replace(/'/g, "'\\''") + "'";
  }

  getShell(): string {
    return 'zsh';
  }

  getShellArgs(): string[] {
    return ['-c'];
  }

  normalizePath(p: string): string {
    return p;
  }
}
