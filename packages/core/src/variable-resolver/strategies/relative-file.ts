import type { VariableStrategy, VariableContext } from '../../types';

export class RelativeFileStrategy implements VariableStrategy {
  name = 'relativeFile';

  resolve(context: VariableContext): string | undefined {
    if (!context.fileAbsolutePath || !context.workspaceRootPath) {
      throw new Error('No active file or workspace');
    }
    const prefix = context.workspaceRootPath.endsWith('/')
      ? context.workspaceRootPath
      : context.workspaceRootPath + '/';
    return context.fileAbsolutePath.replace(prefix, '');
  }
}
