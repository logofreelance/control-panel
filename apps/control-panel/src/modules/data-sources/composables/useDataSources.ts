/**
 * data-sources/composables/useDataSources.ts
 * 
 * CRUD hook for data sources using @cp/frontend-api
 * 
 * ✅ PURE DI: Uses useConfig() hook for all config, messages, and API
 */

'use client';

import { useState, useCallback, useMemo } from 'react';
import { createCrudHook, apiClient } from '@cp/frontend-api';
import { useToast, useConfig } from '@/modules/_core';
import type { DataSource } from '../types';

/**
 * Extended data sources hook with additional actions
 * Uses Pure DI via useConfig() hook
 */
export function useDataSources() {
    // ✅ Pure DI: Get all dependencies from context
    const { msg, api, TOAST_TYPE } = useConfig();
    const { addToast } = useToast();

    // Create endpoints from context
    const endpoints = useMemo(() => ({
        list: api.dataSources.list,
        create: api.dataSources.create,
        detail: (id: string | number) => api.dataSources.detail(Number(id)),
        update: (id: string | number) => api.dataSources.update(Number(id)),
        delete: (id: string | number) => api.dataSources.delete(Number(id)),
    }), [api]);

    // Create CRUD hook with dynamic endpoints
    const useCrud = useMemo(() => createCrudHook<DataSource>(endpoints), [endpoints]);

    const crud = useCrud({
        onSuccess: (action) => {
            // ✅ Use msg from context
            const messages: Record<string, string> = {
                create: msg.dataSources.success.sourceCreated,
                delete: msg.dataSources.success.sourceDeleted,
            };
            if (messages[action]) {
                addToast(messages[action], TOAST_TYPE.SUCCESS);
            }
        },
        onError: (error) => {
            // ✅ Use msg from context
            addToast(error.message || msg.dataSources.error.loadFailed, TOAST_TYPE.ERROR);
        },
    });

    return crud;
}

/**
 * Additional data source actions (clone, archive, etc.)
 * Uses Pure DI via useConfig() hook
 */
export function useDataSourceActions() {
    // ✅ Pure DI: Get all dependencies from context
    const { msg, api, API_STATUS, TOAST_TYPE } = useConfig();
    const { addToast } = useToast();
    const [loading, setLoading] = useState(false);

    const clone = useCallback(async (id: number): Promise<DataSource | null> => {
        setLoading(true);
        try {
            // ✅ Use api from context
            const response = await apiClient.post<DataSource>(`${api.dataSources.list}/${id}/clone`);
            if (response.status === API_STATUS.SUCCESS) {
                // ✅ Use msg from context
                addToast(msg.dataSources.success.sourceCloned, TOAST_TYPE.SUCCESS);
                return response.data || null;
            }
        } catch {
            addToast(msg.dataSources.error.cloneFailed, TOAST_TYPE.ERROR);
        } finally {
            setLoading(false);
        }
        return null;
    }, [addToast, api, msg, API_STATUS, TOAST_TYPE]);

    const archive = useCallback(async (id: number): Promise<boolean> => {
        setLoading(true);
        try {
            // ✅ Use api from context
            const response = await apiClient.delete(api.dataSources.archive(id));
            if (response.status === API_STATUS.SUCCESS) {
                // ✅ Use msg from context
                addToast(msg.dataSources.success.sourceArchived, TOAST_TYPE.SUCCESS);
                return true;
            }
        } catch {
            addToast(msg.dataSources.error.archiveFailed, TOAST_TYPE.ERROR);
        } finally {
            setLoading(false);
        }
        return false;
    }, [addToast, api, msg, API_STATUS, TOAST_TYPE]);

    const restore = useCallback(async (id: number): Promise<boolean> => {
        setLoading(true);
        try {
            // ✅ Use api from context
            const response = await apiClient.post(api.dataSources.restore(id));
            if (response.status === API_STATUS.SUCCESS) {
                // ✅ Use msg from context
                addToast(msg.dataSources.success.sourceRestored, TOAST_TYPE.SUCCESS);
                return true;
            }
        } catch {
            addToast(msg.dataSources.error.restoreFailed, TOAST_TYPE.ERROR);
        } finally {
            setLoading(false);
        }
        return false;
    }, [addToast, api, msg, API_STATUS, TOAST_TYPE]);

    return {
        loading,
        clone,
        archive,
        restore,
    };
}
