// packages/config/src/pagination.ts
// Pagination configuration and helpers

/**
 * Pagination defaults
 */
export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
} as const;

/**
 * Query limits for different operations
 */
export const QUERY_LIMITS = {
    /** Default query limit */
    DEFAULT: 100,

    /** Maximum items per page */
    MAX_PER_PAGE: 100,

    /** Export limit (e.g., CSV export) */
    EXPORT: 5000,

    /** Sample data limit */
    SAMPLE: 5,

    /** Auto-complete suggestions */
    SUGGESTIONS: 10,
} as const;

/**
 * Pagination parameters interface
 */
export interface PaginationParams {
    page: number;
    limit: number;
    offset: number;
}

/**
 * Parse and validate pagination from query parameters
 * 
 * @example
 * const { page, limit, offset } = parsePagination(c.req.query());
 */
export function parsePagination(query: Record<string, string | undefined>): PaginationParams {
    const page = Math.max(1, parseInt(query.page || String(PAGINATION.DEFAULT_PAGE), 10));
    const rawLimit = parseInt(query.limit || String(PAGINATION.DEFAULT_LIMIT), 10);
    const limit = Math.min(PAGINATION.MAX_LIMIT, Math.max(1, rawLimit));

    return {
        page,
        limit,
        offset: (page - 1) * limit,
    };
}

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

/**
 * Build pagination metadata for response
 */
export function buildPaginationMeta(
    page: number,
    limit: number,
    total: number
) {
    return {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
    };
}
