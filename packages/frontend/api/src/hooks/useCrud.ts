/**
 * @repo/frontend-api
 * 
 * CRUD hook factory - create full CRUD operations hook in one line
 */

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../client';
import type { CrudEndpoints, ApiResponse } from '@modular/shared-types';

export interface UseCrudOptions<T> {
    /** Initial data before fetch */
    initialData?: T[];
    /** Skip initial fetch */
    skipInitialFetch?: boolean;
    /** Called on successful create/update/delete */
    onSuccess?: (action: 'create' | 'update' | 'delete', data?: any) => void;
    /** Called on error */
    onError?: (error: Error, action: string) => void;
}

export interface UseCrudReturn<T> {
    // State
    items: T[];
    loading: boolean;
    error: Error | null;

    // Actions
    fetchAll: () => Promise<void>;
    fetchOne: (id: number | string) => Promise<T | null>;
    create: (data: Partial<T>) => Promise<T | null>;
    update: (id: number | string, data: Partial<T>) => Promise<T | null>;
    remove: (id: number | string) => Promise<boolean>;

    // Utilities
    findById: (id: number | string) => T | undefined;
    setItems: React.Dispatch<React.SetStateAction<T[]>>;
}

/**
 * Factory function to create a CRUD hook for any entity
 */
export function createCrudHook<T extends { id: number | string }>(
    endpoints: CrudEndpoints
) {
    return function useCrud(options: UseCrudOptions<T> = {}): UseCrudReturn<T> {
        const {
            initialData = [],
            skipInitialFetch = false,
            onSuccess,
            onError,
        } = options;

        const [items, setItems] = useState<T[]>(initialData);
        const [loading, setLoading] = useState(!skipInitialFetch);
        const [error, setError] = useState<Error | null>(null);

        const handleError = useCallback((err: unknown, action: string) => {
            const error = err instanceof Error ? err : new Error(String(err));
            setError(error);
            onError?.(error, action);
        }, [onError]);

        const fetchAll = useCallback(async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await apiClient.get<T[]>(endpoints.list);
                if (response.status === 'success' && response.data) {
                    setItems(response.data);
                }
            } catch (err) {
                handleError(err, 'fetchAll');
            } finally {
                setLoading(false);
            }
        }, [endpoints.list]);

        const fetchOne = useCallback(async (id: number | string): Promise<T | null> => {
            try {
                const response = await apiClient.get<T>(endpoints.detail(id));
                if (response.status === 'success' && response.data) {
                    return response.data;
                }
            } catch (err) {
                handleError(err, 'fetchOne');
            }
            return null;
        }, [endpoints.detail]);

        const create = useCallback(async (data: Partial<T>): Promise<T | null> => {
            try {
                const response = await apiClient.post<T>(endpoints.create, data);
                if (response.status === 'success' && response.data) {
                    setItems(prev => [...prev, response.data!]);
                    onSuccess?.('create', response.data);
                    return response.data;
                }
            } catch (err) {
                handleError(err, 'create');
            }
            return null;
        }, [endpoints.create, onSuccess]);

        const update = useCallback(async (id: number | string, data: Partial<T>): Promise<T | null> => {
            try {
                const response = await apiClient.put<T>(endpoints.update(id), data);
                if (response.status === 'success' && response.data) {
                    setItems(prev => prev.map(item =>
                        item.id === id ? { ...item, ...response.data } : item
                    ));
                    onSuccess?.('update', response.data);
                    return response.data;
                }
            } catch (err) {
                handleError(err, 'update');
            }
            return null;
        }, [endpoints.update, onSuccess]);

        const remove = useCallback(async (id: number | string): Promise<boolean> => {
            try {
                const response = await apiClient.delete(endpoints.delete(id));
                if (response.status === 'success') {
                    setItems(prev => prev.filter(item => item.id !== id));
                    onSuccess?.('delete', { id });
                    return true;
                }
            } catch (err) {
                handleError(err, 'delete');
            }
            return false;
        }, [endpoints.delete, onSuccess]);

        const findById = useCallback((id: number | string) => {
            return items.find(item => item.id === id);
        }, [items]);

        useEffect(() => {
            if (!skipInitialFetch) {
                fetchAll();
            }
        }, []);

        return {
            items,
            loading,
            error,
            fetchAll,
            fetchOne,
            create,
            update,
            remove,
            findById,
            setItems,
        };
    };
}
