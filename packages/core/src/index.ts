export { VariableResolver } from './variable-resolver';
export { FileStrategy, RelativeFileStrategy, FileBasenameStrategy, FileBasenameNoExtStrategy, FileDirnameStrategy, WorkspaceFolderStrategy, CwdStrategy } from './variable-resolver';
export { UnixShellAdapter, WindowsShellAdapter, createShellAdapter } from './shell-adapter';
export type { CommandConfig, VariableContext, VariableStrategy, OutputEvent } from './types';
export type { ShellAdapter } from './shell-adapter';
