import type { ShellAdapter } from './types';

export class WindowsShellAdapter implements ShellAdapter {
  escapePath(p: string): string {
    if (p.includes(' ') || p.includes('"')) {
      const escaped = p.replace(/"/g, '`"');
      return `"${escaped}"`;
    }
    return p;
  }

  getShell(): string {
    return 'powershell';
  }

  getShellArgs(): string[] {
    return ['-Command'];
  }

  normalizePath(p: string): string {
    return p.replace(/\//g, '\\');
  }
}
