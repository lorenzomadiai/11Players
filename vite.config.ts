import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/test/**/*.{test,spec}.{ts,tsx}'],
    setupFiles: ['./src/test/setup.ts'],
    // Tournament UI tests run real 32-team simulations; the default 5s limit
    // is too tight when the full jsdom suite runs in parallel.
    testTimeout: 15000,
  },
});
