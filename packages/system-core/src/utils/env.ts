import type { Context } from 'hono';

export interface AppEnv {
    DATABASE_URL: string;
    JWT_SECRET: string;
    CORS_ORIGIN: string;
    NODE_ENV: 'development' | 'production' | 'test';
}

import { getEnv as globalGetEnv } from '@cp/config';

export function getEnv(c: Context): AppEnv {
    return globalGetEnv(c) as unknown as AppEnv;
}
