export interface CommandConfig {
  id: string;
  displayName: string;
  command: string;
  workingDir: 'workspaceRoot' | 'fileDir' | 'custom';
  customWorkingDir?: string;
  autoAppendFile?: boolean;
}

export type VscodeMessage =
  | { type: 'COMMANDS_LIST'; payload: CommandConfig[] }
  | { type: 'COMMAND_SAVED'; payload: CommandConfig }
  | { type: 'COMMAND_DELETED'; payload: { id: string } }
  | { type: 'ERROR'; payload: { message: string } };

export type WebviewMessage =
  | { type: 'GET_COMMANDS' }
  | { type: 'SAVE_COMMAND'; payload: CommandConfig }
  | { type: 'DELETE_COMMAND'; payload: { id: string } }
  | { type: 'RUN_COMMAND'; payload: { id: string } };
