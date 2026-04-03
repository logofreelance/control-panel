/**
 * @repo/frontend-table
 * 
 * Pagination hook - manages page state and calculations
 */

import { useState, useMemo, useCallback } from 'react';

export interface UsePaginationOptions {
    /** Initial page number (1-indexed) */
    initialPage?: number;
    /** Items per page */
    initialLimit?: number;
    /** Total number of items */
    total?: number;
}

export interface UsePaginationReturn {
    // State
    page: number;
    limit: number;
    total: number;

    // Computed
    totalPages: number;
    offset: number;
    hasNext: boolean;
    hasPrev: boolean;
    startIndex: number;
    endIndex: number;

    // Actions
    setPage: (page: number) => void;
    setLimit: (limit: number) => void;
    setTotal: (total: number) => void;
    nextPage: () => void;
    prevPage: () => void;
    goToFirst: () => void;
    goToLast: () => void;
}

/**
 * Hook for managing pagination state
 */
export function usePagination(options: UsePaginationOptions = {}): UsePaginationReturn {
    const {
        initialPage = 1,
        initialLimit = 10,
        total: initialTotal = 0,
    } = options;

    const [page, setPageState] = useState(initialPage);
    const [limit, setLimit] = useState(initialLimit);
    const [total, setTotal] = useState(initialTotal);

    const totalPages = useMemo(() => {
        return Math.max(1, Math.ceil(total / limit));
    }, [total, limit]);

    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    const offset = (page - 1) * limit;
    const startIndex = offset + 1;
    const endIndex = Math.min(offset + limit, total);

    const setPage = useCallback((newPage: number) => {
        setPageState(Math.max(1, Math.min(newPage, totalPages)));
    }, [totalPages]);

    const nextPage = useCallback(() => {
        if (hasNext) setPage(page + 1);
    }, [hasNext, page, setPage]);

    const prevPage = useCallback(() => {
        if (hasPrev) setPage(page - 1);
    }, [hasPrev, page, setPage]);

    const goToFirst = useCallback(() => {
        setPage(1);
    }, [setPage]);

    const goToLast = useCallback(() => {
        setPage(totalPages);
    }, [setPage, totalPages]);

    return {
        page,
        limit,
        total,
        totalPages,
        offset,
        hasNext,
        hasPrev,
        startIndex,
        endIndex,
        setPage,
        setLimit,
        setTotal,
        nextPage,
        prevPage,
        goToFirst,
        goToLast,
    };
}
