import path from 'node:path';
import type { VariableContext, VariableStrategy } from '../types';

export class VariableResolver {
  private strategies: Map<string, VariableStrategy> = new Map();

  constructor() {}

  register(strategy: VariableStrategy): void {
    this.strategies.set(strategy.name, strategy);
  }

  resolve(command: string, context: VariableContext): string {
    const hasVariables = /\$\{[^}]+\}/.test(command);

    if (!hasVariables) {
      const relativeStrategy = this.strategies.get('relativeFile');
      if (relativeStrategy && context.workspaceRootPath && context.fileAbsolutePath) {
        try {
          const relativePath = path.relative(context.workspaceRootPath, context.fileAbsolutePath);
          if (relativePath) {
            return `${command} ${relativePath}`;
          }
        } catch {
          // Cannot resolve relativeFile, return command unchanged
        }
      }
      return command;
    }

    return command.replace(/\$\{([^}]+)\}/g, (_match, name: string) => {
      const strategy = this.strategies.get(name);
      if (!strategy) {
        return `\${${name}}`;
      }
      const resolved = strategy.resolve(context);
      if (resolved === undefined) {
        throw new Error(`Cannot resolve \${${name}}: no active file or workspace`);
      }
      return resolved;
    });
  }
}
