import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import type { CommandExecutorOptions } from './types';
import { timestamp, formatFile, formatStatus } from './output-channel';

export class CommandExecutor {
  private process: ChildProcess | null = null;
  private resolveFn: ((value: number | null) => void) | null = null;

  async execute(options: CommandExecutorOptions): Promise<number | null> {
    const {
      command,
      workingDirectory,
      shellAdapter,
      variableResolver,
      variableContext,
      timeoutMs = 30000,
      autoAppendFile = true,
      onOutput,
      signal,
    } = options;

    const resolvedCommand = variableResolver.resolve(command, variableContext, (v) => shellAdapter.escapePath(v), autoAppendFile);
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
      let settled = false;
      const safeResolve = (val: number | null) => {
        if (!settled) {
          settled = true;
          this.resolveFn = null;
          resolve(val);
        }
      };
      const safeReject = (err: Error) => {
        if (!settled) {
          settled = true;
          this.resolveFn = null;
          reject(err);
        }
      };

      this.resolveFn = safeResolve;

      let child: ChildProcess;
      try {
        child = spawn(shell, [...shellArgs, resolvedCommand], {
          cwd,
          shell: false,
          env: process.env,
        });
      } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        onOutput?.({ type: 'stderr', message: `Spawn error: ${err.message}` });
        safeReject(err);
        return;
      }

      this.process = child;

      const timeout = setTimeout(() => {
        child.kill('SIGTERM');
        onOutput?.({ type: 'status', message: formatStatus(null) });
        safeResolve(null);
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
        safeReject(error);
      });

      child.on('close', (code: number | null) => {
        clearTimeout(timeout);
        onOutput?.({ type: 'status', message: formatStatus(code) });
        safeResolve(code);
      });

      signal?.addEventListener('abort', () => {
        clearTimeout(timeout);
        child.kill('SIGTERM');
        onOutput?.({ type: 'status', message: formatStatus(null) });
        safeResolve(null);
      }, { once: true });
    });
  }

  cancel(): void {
    if (this.process && !this.process.killed) {
      this.process.kill('SIGTERM');
    }
    if (this.resolveFn) {
      this.resolveFn(null);
    }
  }
}
