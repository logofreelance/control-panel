/**
 * @repo/frontend-api
 * 
 * API client wrapper with built-in transformations
 */

import { toCamelCase, toSnakeCase } from '@/lib/shared-transforms';
import type { ApiResponse } from '@/lib/shared-types';

export interface FetchOptions extends RequestInit {
    /** Transform response keys from snake_case to camelCase (default: true) */
    transformResponse?: boolean;
    /** Transform request body keys from camelCase to snake_case (default: true) */
    transformRequest?: boolean;
}

/**
 * Enhanced fetch wrapper with automatic transformations
 */
export async function apiFetch<T = any>(
    url: string,
    options: FetchOptions = {}
): Promise<ApiResponse<T>> {
    const {
        transformResponse = true,
        transformRequest = true,
        body,
        headers,
        ...restOptions
    } = options;

    // Transform request body
    let processedBody = body;
    if (body && transformRequest && typeof body === 'string') {
        try {
            const parsed = JSON.parse(body);
            processedBody = JSON.stringify(toSnakeCase(parsed));
        } catch {
            // Not JSON, keep as-is
        }
    }

    const response = await fetch(url, {
        ...restOptions,
        body: processedBody,
        headers: {
            'Content-Type': 'application/json',
            ...headers,
        },
    });

    const json = await response.json();

    // Transform response
    if (transformResponse) {
        return toCamelCase<ApiResponse<T>>(json);
    }

    return json as ApiResponse<T>;
}

/**
 * HTTP methods shortcuts
 */
export const apiClient = {
    get: <T = any>(url: string, options?: FetchOptions) =>
        apiFetch<T>(url, { ...options, method: 'GET' }),

    post: <T = any>(url: string, data?: any, options?: FetchOptions) =>
        apiFetch<T>(url, {
            ...options,
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        }),

    put: <T = any>(url: string, data?: any, options?: FetchOptions) =>
        apiFetch<T>(url, {
            ...options,
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined,
        }),

    patch: <T = any>(url: string, data?: any, options?: FetchOptions) =>
        apiFetch<T>(url, {
            ...options,
            method: 'PATCH',
            body: data ? JSON.stringify(data) : undefined,
        }),

    delete: <T = any>(url: string, options?: FetchOptions) =>
        apiFetch<T>(url, { ...options, method: 'DELETE' }),
};
