import type { ShellAdapter } from './types';
import { UnixShellAdapter } from './unix';
import { WindowsShellAdapter } from './windows';

export type { ShellAdapter };
export { UnixShellAdapter, WindowsShellAdapter };

export function createShellAdapter(): ShellAdapter {
  return process.platform === 'win32' ? new WindowsShellAdapter() : new UnixShellAdapter();
}
