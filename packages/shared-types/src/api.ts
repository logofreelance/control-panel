/**
 * @repo/shared-types
 * 
 * Common TypeScript types used in both frontend and backend.
 * API Response wrappers and standard data structures.
 */

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = any> {
    status: 'success' | 'error';
    data?: T;
    message?: string;
    errors?: Record<string, string[]>;
}

/**
 * Paginated result wrapper
 */
export interface PaginatedResult<T> {
    rows: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

/**
 * Standard CRUD endpoint configuration
 */
export interface CrudEndpoints {
    list: string;
    create: string;
    detail: (id: number | string) => string;
    update: (id: number | string) => string;
    delete: (id: number | string) => string;
}

