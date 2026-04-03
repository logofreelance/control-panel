/**
 * @repo/frontend-api
 * 
 * React hooks for data fetching
 */

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../client';
import type { ApiResponse } from '@/lib/shared-types';

export interface UseFetchOptions {
    /** Initial data before fetch completes */
    initialData?: any;
    /** Skip initial fetch (manual trigger only) */
    skip?: boolean;
    /** Dependencies that trigger refetch */
    deps?: any[];
}

export interface UseFetchReturn<T> {
    data: T | null;
    loading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
}

/**
 * Hook for fetching data with automatic loading/error states
 */
export function useFetch<T = any>(
    url: string | null,
    options: UseFetchOptions = {}
): UseFetchReturn<T> {
    const { initialData = null, skip = false, deps = [] } = options;

    const [data, setData] = useState<T | null>(initialData);
    const [loading, setLoading] = useState(!skip && !!url);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = useCallback(async () => {
        if (!url) return;

        setLoading(true);
        setError(null);

        try {
            const response = await apiClient.get<T>(url);
            if (response.status === 'success' && response.data !== undefined) {
                setData(response.data);
            } else {
                throw new Error(response.message || 'Fetch failed');
            }
        } catch (err) {
            setError(err instanceof Error ? err : new Error(String(err)));
        } finally {
            setLoading(false);
        }
    }, [url]);

    useEffect(() => {
        if (!skip && url) {
            fetchData();
        }
    }, [url, skip, ...deps]);

    return {
        data,
        loading,
        error,
        refetch: fetchData,
    };
}
