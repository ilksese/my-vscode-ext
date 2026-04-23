import type { ShellAdapter } from '../shell-adapter';
import type { VariableResolver } from '../variable-resolver';
import type { VariableContext } from '../types';

export interface CommandExecutorOptions {
  command: string;
  workingDirectory: string;
  shellAdapter: ShellAdapter;
  variableResolver: VariableResolver;
  variableContext: VariableContext;
  timeoutMs?: number;
  onOutput?: (event: { type: 'stdout' | 'stderr' | 'info' | 'status'; message: string }) => void;
  signal?: AbortSignal;
}
