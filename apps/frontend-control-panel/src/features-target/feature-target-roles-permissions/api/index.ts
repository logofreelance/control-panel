/**
 * feature-target-roles-permissions/api/index.ts
 * 
 * Unified API configuration for Roles and Permissions
 */

import { env } from '@/lib/env';

export const API = {
    roles: {
        list: `${env.API_URL}/roles`,
        detail: (id: number | string) => `${env.API_URL}/roles/${id}`,
        // Use standard paths as mapped in the backend
        base: `${env.API_URL}/roles`,
    },
    permissions: {
        list: `${env.API_URL}/permissions`,
        detail: (id: number | string) => `${env.API_URL}/permissions/${id}`,
        base: `${env.API_URL}/permissions`,
    }
} as const;
