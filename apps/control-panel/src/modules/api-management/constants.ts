import { env } from '@/lib/env';
import { RESOURCE_ROUTES } from '@cp/constants';

const BASE_URL = `${env.API_BASE}${RESOURCE_ROUTES.API_MANAGEMENT}`;

export const API_MANAGEMENT_API = {
    categories: {
        list: `${BASE_URL}/categories`,
        save: `${BASE_URL}/categories`,
        delete: (id: number) => `${BASE_URL}/categories/${id}`,
    },
    endpoints: {
        list: `${BASE_URL}/endpoints`,
        save: `${BASE_URL}/endpoints`,
        detail: (id: number) => `${BASE_URL}/endpoints/${id}`,
        stats: `${BASE_URL}/endpoints/stats`,
        check: `${BASE_URL}/endpoints/check`,
        delete: (id: number) => `${BASE_URL}/endpoints/${id}`,
        toggle: (id: number) => `${BASE_URL}/endpoints/${id}/toggle`,
    },
    logs: `${BASE_URL}/logs`
};
