import type { VariableStrategy, VariableContext } from '../../types';
import path from 'node:path';

export class FileBasenameNoExtStrategy implements VariableStrategy {
  name = 'fileBasenameNoExtension';

  resolve(context: VariableContext): string | undefined {
    if (!context.fileAbsolutePath) {
      throw new Error('No active file');
    }
    const basename = path.basename(context.fileAbsolutePath);
    return basename.replace(/\.[^.]+$/, '');
  }
}
