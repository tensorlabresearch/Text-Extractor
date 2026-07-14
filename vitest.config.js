import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.{js,mjs}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'lcov'],
      include: [
        'extension/service_worker.js',
        'extension/workspace.js',
        'extension/lib/app/**/*.js',
        'extension/lib/document/**/*.js',
        'extension/lib/pdf/**/*.js',
        'extension/lib/image/**/*.js',
        'extension/lib/ocr/**/*.js',
        'extension/lib/ui/**/*.js',
      ],
      exclude: [
        'extension/lib/vendor/**',
        'extension/workers/**',
      ],
      thresholds: {
        statements: 10,
        branches: 20,
        functions: 15,
        lines: 10,
      },
    },
  },
});
