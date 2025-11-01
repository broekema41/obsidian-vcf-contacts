// vitest.config.ts
import * as path from "node:path";

import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      obsidian: path.resolve(__dirname, 'tests/setup/emptyObsidianMock.ts'),
    },
  },
  test: {
    include: ['tests/**/*.spec.ts'],
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'html'],
      reportsDirectory: './coverage',
      include: ['src/context/*.ts', 'src/contacts/vcard/**/*.ts', 'src/util/photoLine.ts'],
      exclude: ['src/**/*.tsx', 'src/**/*.d.ts']
    },
  },
});
