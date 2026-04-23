import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import type { CommandExecutorOptions } from './types';
import { timestamp, formatFile, formatStatus } from './output-channel';

export class CommandExecutor {
  private process: ChildProcess | null = null;

  async execute(options: CommandExecutorOptions): Promise<number | null> {
    const {
      command,
      workingDirectory,
      shellAdapter,
      variableResolver,
      variableContext,
      timeoutMs = 30000,
      onOutput,
      signal,
    } = options;

    const resolvedCommand = variableResolver.resolve(command, variableContext);
    const ts = timestamp();

    onOutput?.({ type: 'info', message: `${ts} [Info] Executing: ${resolvedCommand}` });

    if (variableContext.fileAbsolutePath && variableContext.workspaceRootPath) {
      const relativeFile = path.relative(
        variableContext.workspaceRootPath,
        variableContext.fileAbsolutePath
      );
      onOutput?.({ type: 'info', message: formatFile(relativeFile) });
    }

    const cwd = workingDirectory;
    const shell = shellAdapter.getShell();
    const shellArgs = shellAdapter.getShellArgs();

    return new Promise((resolve, reject) => {
      const child = spawn(shell, [...shellArgs, resolvedCommand], {
        cwd,
        shell: false,
        env: process.env,
      });

      this.process = child;

      const timeout = setTimeout(() => {
        child.kill('SIGTERM');
        onOutput?.({ type: 'status', message: formatStatus(null) });
        resolve(null);
      }, timeoutMs);

      child.stdout?.on('data', (data: Buffer) => {
        onOutput?.({ type: 'stdout', message: data.toString() });
      });

      child.stderr?.on('data', (data: Buffer) => {
        onOutput?.({ type: 'stderr', message: data.toString() });
      });

      child.on('error', (error: Error) => {
        clearTimeout(timeout);
        onOutput?.({ type: 'stderr', message: `Process error: ${error.message}` });
        reject(error);
      });

      child.on('close', (code: number | null) => {
        clearTimeout(timeout);
        onOutput?.({ type: 'status', message: formatStatus(code) });
        resolve(code);
      });

      signal?.addEventListener('abort', () => {
        clearTimeout(timeout);
        child.kill('SIGTERM');
        onOutput?.({ type: 'status', message: formatStatus(null) });
        resolve(null);
      });
    });
  }

  cancel(): void {
    if (this.process && !this.process.killed) {
      this.process.kill('SIGTERM');
    }
  }
}
