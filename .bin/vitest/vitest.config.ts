import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        cache: false,
        clearMocks: true,
        environment: 'node',
        pool: 'forks',
        testTimeout: 60000,
        setupFiles: ['.bin/vitest/setup/to-throw-error-with.ts'], // you can add your own setup files here (e.g. silence logging, set npm userconfig)
        watch: false,
        coverage: {
            include: ['src/**/*.ts', 'src/**/*.js'],
            provider: 'v8',
        },
    },
});
