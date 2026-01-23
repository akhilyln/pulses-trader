import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vitest-tsconfig-paths';

export default defineConfig({
    plugins: [react(), tsconfigPaths()],
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./src/test/setup.ts'],
        exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**', '**/.{idea,git,cache,output,temp}/**'],
    },
});
