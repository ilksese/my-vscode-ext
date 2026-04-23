import type { VariableStrategy, VariableContext } from '../../types';

export class WorkspaceFolderStrategy implements VariableStrategy {
  name = 'workspaceFolder';

  resolve(context: VariableContext): string | undefined {
    if (!context.workspaceRootPath) {
      throw new Error('No workspace folder');
    }
    return context.workspaceRootPath;
  }
}
