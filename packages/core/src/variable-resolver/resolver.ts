import path from 'node:path';
import type { VariableContext, VariableStrategy } from '../types';

export class VariableResolver {
  private strategies: Map<string, VariableStrategy> = new Map();

  register(strategy: VariableStrategy): void {
    this.strategies.set(strategy.name, strategy);
  }

  resolve(
    command: string,
    context: VariableContext,
    escapeFn?: (value: string) => string,
    autoAppend?: boolean
  ): string {
    const hasVariables = /\$\{[^}]+\}/.test(command);

    if (!hasVariables) {
      if (autoAppend !== false) {
        const relativeStrategy = this.strategies.get('relativeFile');
        if (relativeStrategy && context.workspaceRootPath && context.fileAbsolutePath) {
          try {
            const relativePath = path.relative(context.workspaceRootPath, context.fileAbsolutePath);
            if (relativePath) {
              const escaped = escapeFn ? escapeFn(relativePath) : relativePath;
              return `${command} ${escaped}`;
            }
          } catch {
            // Cannot resolve relativeFile, return command unchanged
          }
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
      return escapeFn ? escapeFn(resolved) : resolved;
    });
  }
}
