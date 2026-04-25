import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      react: 'preact/compat',
      'react-dom': 'preact/compat',
    },
  },
  build: {
    outDir: path.resolve(__dirname, '../dist/webview'),
    minify: false,
    target: 'esnext',
    emptyOutDir: true,
    sourcemap: false,
    rolldownOptions: {
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]',
      },
    },
    assetsInclude: ['**/*.css'],
  },
  base: './',
});
