import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/index.ts'],
    format: ['esm'],
    dts: true,
    clean: true,
    sourcemap: true,
    external: [
        'drizzle-orm',
        'drizzle-orm/mysql-core',
        'drizzle-orm/tidb-serverless',
        '@tidbcloud/serverless',
        '@lucia-auth/adapter-drizzle',
        'mysql2',
    ],
});
