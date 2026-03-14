/**
 * data-sources/composables/useResources.ts
 * 
 * CRUD hook for resources (nested under data source)
 * 
 * ✅ PURE DI: Uses useConfig() hook for all config, messages, and API
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '@cp/frontend-api';
import { useToast, useConfig } from '@/modules/_core';
import type { Resource } from '../types';

export interface UseResourcesOptions {
    /** Skip initial fetch */
    skipInitialFetch?: boolean;
}

export interface UseResourcesReturn {
    items: Resource[];
    loading: boolean;
    error: Error | null;
    fetchAll: () => Promise<void>;
    fetchOne: (resourceId: number) => Promise<Resource | null>;
    create: (data: Partial<Resource>) => Promise<Resource | null>;
    update: (resourceId: number, data: Partial<Resource>) => Promise<Resource | null>;
    remove: (resourceId: number) => Promise<boolean>;
}

/**
 * Hook for managing resources under a specific data source
 * Uses Pure DI via useConfig() hook
 */
export function useResources(
    dataSourceId: number | null,
    options: UseResourcesOptions = {}
): UseResourcesReturn {
    const { skipInitialFetch = false } = options;
    // ✅ Pure DI: Get all dependencies from context
    const { msg, api, API_STATUS, TOAST_TYPE } = useConfig();
    const { addToast } = useToast();

    const [items, setItems] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchAll = useCallback(async () => {
        if (!dataSourceId) return;

        setLoading(true);
        setError(null);
        try {
            // ✅ Use api from context
            const response = await apiClient.get<Resource[]>(api.dataSources.resources(dataSourceId));
            if (response.status === API_STATUS.SUCCESS && response.data) {
                setItems(response.data);
            }
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            setError(error);
            // ✅ Use msg from context
            addToast(msg.dataSources.error.resourceLoadFailed, TOAST_TYPE.ERROR);
        } finally {
            setLoading(false);
        }
    }, [dataSourceId, addToast, api, msg, API_STATUS, TOAST_TYPE]);

    const fetchOne = useCallback(async (resourceId: number): Promise<Resource | null> => {
        if (!dataSourceId) return null;

        try {
            // ✅ Use api from context
            const response = await apiClient.get<Resource>(
                `${api.dataSources.resources(dataSourceId)}/${resourceId}`
            );
            if (response.status === API_STATUS.SUCCESS && response.data) {
                return response.data;
            }
        } catch {
            // ✅ Use msg from context
            addToast(msg.dataSources.error.resourceLoadFailed, TOAST_TYPE.ERROR);
        }
        return null;
    }, [dataSourceId, addToast, api, msg, API_STATUS, TOAST_TYPE]);

    const create = useCallback(async (data: Partial<Resource>): Promise<Resource | null> => {
        if (!dataSourceId) return null;

        try {
            // ✅ Use api from context
            const response = await apiClient.post<Resource>(
                api.dataSources.createResource(dataSourceId),
                data
            );
            if (response.status === API_STATUS.SUCCESS && response.data) {
                setItems(prev => [...prev, response.data!]);
                // ✅ Use msg from context
                addToast(msg.dataSources.success.resourceCreated, TOAST_TYPE.SUCCESS);
                return response.data;
            }
        } catch {
            addToast(msg.dataSources.error.resourceCreateFailed, TOAST_TYPE.ERROR);
        }
        return null;
    }, [dataSourceId, addToast, api, msg, API_STATUS, TOAST_TYPE]);

    const update = useCallback(async (
        resourceId: number,
        data: Partial<Resource>
    ): Promise<Resource | null> => {
        if (!dataSourceId) return null;

        try {
            // ✅ Use api from context
            const response = await apiClient.put<Resource>(
                api.dataSources.updateResource(dataSourceId, resourceId),
                data
            );
            if (response.status === API_STATUS.SUCCESS && response.data) {
                setItems(prev => prev.map(item =>
                    item.id === resourceId ? { ...item, ...response.data } : item
                ));
                // ✅ Use msg from context
                addToast(msg.dataSources.success.resourceUpdated, TOAST_TYPE.SUCCESS);
                return response.data;
            }
        } catch {
            addToast(msg.dataSources.error.resourceUpdateFailed, TOAST_TYPE.ERROR);
        }
        return null;
    }, [dataSourceId, addToast, api, msg, API_STATUS, TOAST_TYPE]);

    const remove = useCallback(async (resourceId: number): Promise<boolean> => {
        if (!dataSourceId) return false;

        try {
            // ✅ Use api from context
            const response = await apiClient.delete(
                api.dataSources.deleteResource(dataSourceId, resourceId)
            );
            if (response.status === API_STATUS.SUCCESS) {
                setItems(prev => prev.filter(item => item.id !== resourceId));
                // ✅ Use msg from context
                addToast(msg.dataSources.success.resourceDeleted, TOAST_TYPE.SUCCESS);
                return true;
            }
        } catch {
            addToast(msg.dataSources.error.resourceDeleteFailed, TOAST_TYPE.ERROR);
        }
        return false;
    }, [dataSourceId, addToast, api, msg, API_STATUS, TOAST_TYPE]);

    // Auto-fetch when dataSourceId changes
    useEffect(() => {
        if (dataSourceId && !skipInitialFetch) {
            fetchAll();
        } else {
            setItems([]);
        }
    }, [dataSourceId, skipInitialFetch, fetchAll]);

    return {
        items,
        loading,
        error,
        fetchAll,
        fetchOne,
        create,
        update,
        remove,
    };
}
