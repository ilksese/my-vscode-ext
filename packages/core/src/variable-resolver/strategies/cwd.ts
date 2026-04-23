import type { VariableStrategy, VariableContext } from '../../types';

export class CwdStrategy implements VariableStrategy {
  name = 'cwd';

  resolve(context: VariableContext): string | undefined {
    return context.cwd;
  }
}
