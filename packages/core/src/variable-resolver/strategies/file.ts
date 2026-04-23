import type { VariableStrategy, VariableContext } from '../../types';

export class FileStrategy implements VariableStrategy {
  name = 'file';

  resolve(context: VariableContext): string | undefined {
    if (!context.fileAbsolutePath) {
      throw new Error('No active file');
    }
    return context.fileAbsolutePath;
  }
}
