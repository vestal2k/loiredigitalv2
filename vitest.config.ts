import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@layouts': path.resolve(__dirname, './src/layouts'),
      '@config': path.resolve(__dirname, './src/config'),
    },
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    exclude: ['e2e/**', 'node_modules/**', 'dist/**', '.astro/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '.astro/',
        '*.config.*',
        'e2e/**',
      ],
    },
  },
});
