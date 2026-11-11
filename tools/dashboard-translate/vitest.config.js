import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: [
      'tests/unit/dashboardTranslate.test.js',
      'tests/unit/dashboardTranslateStress.test.js',
    ],
  },
});
