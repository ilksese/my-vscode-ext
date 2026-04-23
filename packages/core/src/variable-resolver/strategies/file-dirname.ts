import type { VariableStrategy, VariableContext } from '../../types';
import path from 'node:path';

export class FileDirnameStrategy implements VariableStrategy {
  name = 'fileDirname';

  resolve(context: VariableContext): string | undefined {
    if (!context.fileAbsolutePath) {
      throw new Error('No active file');
    }
    return path.dirname(context.fileAbsolutePath);
  }
}
