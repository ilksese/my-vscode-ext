import type { VariableStrategy, VariableContext } from '../../types';
import path from 'node:path';

export class RelativeFileStrategy implements VariableStrategy {
  name = 'relativeFile';

  resolve(context: VariableContext): string | undefined {
    if (!context.fileAbsolutePath || !context.workspaceRootPath) {
      throw new Error('No active file or workspace');
    }
    return path.relative(context.workspaceRootPath, context.fileAbsolutePath);
  }
}
