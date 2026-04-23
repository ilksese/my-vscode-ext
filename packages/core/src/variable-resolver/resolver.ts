import type { VariableContext, VariableStrategy } from '../types';

export class VariableResolver {
  private strategies: Map<string, VariableStrategy> = new Map();

  constructor() {}

  register(strategy: VariableStrategy): void {
    this.strategies.set(strategy.name, strategy);
  }

  resolve(command: string, context: VariableContext): string {
    const hasVariables = /\$\{[^}]+\}/.test(command);

    if (!hasVariables && context.fileAbsolutePath && context.workspaceRootPath) {
      const relativePath = context.fileAbsolutePath.replace(context.workspaceRootPath + '/', '');
      return `${command} ${relativePath}`;
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
