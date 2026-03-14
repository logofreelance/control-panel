// error-templates/api/index.ts
// API endpoints for Error Templates module
// STANDARDIZED: Uses env.API_BASE + relative paths

import { env } from '@/lib/env';

export const API = {
    list: `${env.API_BASE}/error-templates`,
    global: `${env.API_BASE}/error-templates/global`,
    save: `${env.API_BASE}/error-templates`,
    delete: (id: number) => `${env.API_BASE}/error-templates/${id}`,
} as const;
