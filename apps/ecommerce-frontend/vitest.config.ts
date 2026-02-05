import { defineConfig } from 'vitest/config';
import angular from '@analogjs/vite-plugin-angular';

export default defineConfig({
    plugins: [angular()],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['src/setup.spec.ts'],
        include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
        exclude: ['**/node_modules/**', '**/dist/**', 'src/setup.spec.ts'],
    },
});
