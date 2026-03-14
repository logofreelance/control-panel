/**
 * @repo/frontend-api
 * 
 * Create CRUD endpoint configuration from base URL
 */

import type { CrudEndpoints } from '@modular/shared-types';

/**
 * Generate standard CRUD endpoint functions from base URL
 */
export function createEndpoints(baseUrl: string): CrudEndpoints {
    return {
        list: baseUrl,
        create: baseUrl,
        detail: (id) => `${baseUrl}/${id}`,
        update: (id) => `${baseUrl}/${id}`,
        delete: (id) => `${baseUrl}/${id}`,
    };
}

/**
 * Create endpoints with custom suffix paths
 */
export function createEndpointsAdvanced(
    baseUrl: string,
    options: {
        archive?: boolean;
        restore?: boolean;
        custom?: Record<string, string | ((id: number | string) => string)>;
    } = {}
): CrudEndpoints & Record<string, any> {
    const endpoints: any = createEndpoints(baseUrl);

    if (options.archive) {
        endpoints.archive = (id: number | string) => `${baseUrl}/${id}`;
        endpoints.destroy = (id: number | string) => `${baseUrl}/${id}/destroy`;
    }

    if (options.restore) {
        endpoints.restore = (id: number | string) => `${baseUrl}/${id}/restore`;
    }

    if (options.custom) {
        for (const [key, value] of Object.entries(options.custom)) {
            if (typeof value === 'function') {
                endpoints[key] = value;
            } else {
                endpoints[key] = `${baseUrl}${value}`;
            }
        }
    }

    return endpoints;
}
