/**
 * Fitur: Dynamic Routes (Frontend Control Panel)
 * File: api/index.ts
 * Deskripsi: Kumpulan rute untuk menembak API Backend Control Panel.
 * Fitur ini sepenuhnya mandiri (isolated) dan tidak import endpoint dari luar.
 */

import { env } from '@/lib/env';

const BASE_URL = `${env.API_URL}/route-builder`;

export const DYNAMIC_ROUTES_API = {
    categories: {
        list: `${BASE_URL}/categories`,
        save: `${BASE_URL}/categories`,
        delete: (id: string) => `${BASE_URL}/categories/${id}`,
    },
    endpoints: {
        list: `${BASE_URL}/endpoints`,
        save: `${BASE_URL}/endpoints`,
        detail: (id: string) => `${BASE_URL}/endpoints/${id}`,
        stats: `${BASE_URL}/endpoints/stats`,
        delete: (id: string) => `${BASE_URL}/endpoints/${id}`,
        toggle: (id: string) => `${BASE_URL}/endpoints/${id}/toggle`,
    },
    apiRoutes: `${BASE_URL}/api-routes`,
    logs: `${BASE_URL}/logs`,
    errorTemplates: {
        list: `${BASE_URL}/error-templates`,
        save: `${BASE_URL}/error-templates`,
        delete: (id: string) => `${BASE_URL}/error-templates/${id}`,
    }
};
