import type { VariableStrategy, VariableContext } from '../../types';
import path from 'node:path';

export class FileBasenameStrategy implements VariableStrategy {
  name = 'fileBasename';

  resolve(context: VariableContext): string | undefined {
    if (!context.fileAbsolutePath) {
      throw new Error('No active file');
    }
    return path.basename(context.fileAbsolutePath);
  }
}
