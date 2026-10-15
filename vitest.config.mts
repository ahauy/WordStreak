import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    alias: {
      '@prisma/client': path.resolve(import.meta.dirname, 'apps/api/node_modules/@prisma/client'),
      '@prisma/adapter-pg': path.resolve(import.meta.dirname, 'apps/api/node_modules/@prisma/adapter-pg'),
      'pg': path.resolve(import.meta.dirname, 'apps/api/node_modules/pg'),
    },
  },
});
