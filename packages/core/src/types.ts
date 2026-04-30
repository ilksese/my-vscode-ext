export interface CommandConfig {
  id: string;
  displayName: string;
  command: string;
  workingDir: 'workspaceRoot' | 'fileDir' | 'custom';
  customWorkingDir?: string;
  autoAppendFile?: boolean;
}

export interface VariableContext {
  fileAbsolutePath?: string;
  workspaceRootPath?: string;
  cwd: string;
}

export interface VariableStrategy {
  name: string;
  resolve(context: VariableContext): string | undefined;
}

export interface OutputEvent {
  type: 'stdout' | 'stderr' | 'info' | 'status';
  message: string;
}
