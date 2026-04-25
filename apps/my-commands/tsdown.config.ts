import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: {
    extension: 'src/extension.ts',
  },
  target: 'es2025',
  outDir: 'dist',
  format: 'cjs',
  platform: 'node',
  deps: {
    neverBundle: ['vscode'],
    alwaysBundle: ['@suite/core']
  },
  dts: false,
  minify: false,
  sourcemap: false,
});