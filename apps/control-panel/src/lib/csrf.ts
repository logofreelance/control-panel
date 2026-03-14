/**
 * CSRF Token Management for Frontend
 * Handles fetching and including CSRF tokens in requests
 */

import { env } from './env';

const CSRF_TOKEN_HEADER = 'x-csrf-token';
const CSRF_TOKEN_ENDPOINT = `${env.API_BASE}/csrf-token`;

let csrfTokenCache: string | null = null;
let tokenFetchPromise: Promise<string> | null = null;

/**
 * Get CSRF token from cookie or fetch from server
 * Token is stored in httpOnly cookie, but we need to read it from API
 */
async function fetchCsrfToken(): Promise<string> {
    // If already fetching, return the same promise
    if (tokenFetchPromise) {
        return tokenFetchPromise;
    }

    // Create fetch promise
    tokenFetchPromise = (async () => {
        try {
            const response = await fetch(CSRF_TOKEN_ENDPOINT, {
                method: 'GET',
                credentials: 'include', // Include cookies
            });

            if (!response.ok) {
                throw new Error('Failed to fetch CSRF token');
            }

            const data = await response.json();
            const token = data.token;

            if (!token) {
                throw new Error('CSRF token not found in response');
            }

            csrfTokenCache = token;
            return token;
        } catch (error) {
            console.error('CSRF token fetch error:', error);
            throw error;
        } finally {
            tokenFetchPromise = null;
        }
    })();

    return tokenFetchPromise;
}

/**
 * Get CSRF token (cached or fetch)
 */
export async function getCsrfToken(): Promise<string> {
    if (csrfTokenCache) {
        return csrfTokenCache;
    }

    return fetchCsrfToken();
}

/**
 * Clear CSRF token cache (e.g., on logout)
 */
export function clearCsrfToken(): void {
    csrfTokenCache = null;
    tokenFetchPromise = null;
}

/**
 * Add CSRF token to fetch options
 */
export async function addCsrfToken(options: RequestInit = {}): Promise<RequestInit> {
    const token = await getCsrfToken();

    return {
        ...options,
        headers: {
            ...options.headers,
            [CSRF_TOKEN_HEADER]: token,
        },
    };
}

/**
 * Wrapper for fetch that automatically includes CSRF token
 */
export async function fetchWithCsrf(
    url: string,
    options: RequestInit = {}
): Promise<Response> {
    const optionsWithCsrf = await addCsrfToken(options);
    return fetch(url, {
        ...optionsWithCsrf,
        credentials: 'include', // Include cookies
    });
}
