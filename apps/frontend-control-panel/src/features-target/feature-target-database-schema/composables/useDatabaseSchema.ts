/**
 * database-schema/composables/usedatabaseSchema.ts
 * 
 * CRUD hook for data sources using @repo/frontend-api
 * 
 * ✅ PURE DI: Uses useConfig() hook for all config, messages, and API
 */

'use client';

import { useState, useCallback, useMemo } from 'react';
import { createCrudHook, apiClient } from '@/lib/frontend-api';
import { useToast, useConfig } from '@/modules/_core';
import type { DatabaseTable } from '../types';

/**
 * Extended database schema hook with additional actions
 * Uses Pure DI via useConfig() hook
 */
export function useDatabaseSchema() {
    // ✅ Pure DI: Get all dependencies from context
    const { msg, api, TOAST_TYPE } = useConfig();
    const { addToast } = useToast();

    // Create endpoints from context
    const endpoints = useMemo(() => ({
        list: api.databaseSchema.list,
        create: api.databaseSchema.save,
        detail: (id: string | number) => api.databaseSchema.detail?.(String(id)) || `${api.databaseSchema.list}/${id}`,
        update: (id: string | number) => api.databaseSchema.update?.(String(id)) || `${api.databaseSchema.list}/${id}`,
        delete: (id: string | number) => api.databaseSchema.delete(String(id)),
    }), [api]);

    // Create CRUD hook with dynamic endpoints
    const useCrud = useMemo(() => createCrudHook<DatabaseTable>(endpoints), [endpoints]);

    const crud = useCrud({
        onSuccess: (action: any) => {
            // ✅ Use msg from context
            const messages: Record<string, string> = {
                create: msg.databaseSchema.success.sourceCreated,
                delete: msg.databaseSchema.success.sourceDeleted,
            };
            if (messages[action]) {
                addToast(messages[action], TOAST_TYPE.SUCCESS);
            }
        },
        onError: (error: any) => {
            // ✅ Use msg from context
            addToast(error.message || msg.databaseSchema.error.loadFailed, TOAST_TYPE.ERROR);
        },
    });

    return crud;
}

/**
 * Additional database schema actions (clone, archive, etc.)
 * Uses Pure DI via useConfig() hook
 */
export function useSchemaActions() {
    // ✅ Pure DI: Get all dependencies from context
    const { msg, api, API_STATUS, TOAST_TYPE } = useConfig();
    const { addToast } = useToast();
    const [loading, setLoading] = useState(false);

    const clone = useCallback(async (id: string | number): Promise<DatabaseTable | null> => {
        setLoading(true);
        try {
            // ✅ Use api from context
            const response = await apiClient.post<DatabaseTable>(`${api.databaseSchema.list}/${id}/clone`);
            if (response.status === API_STATUS.SUCCESS) {
                // ✅ Use msg from context
                addToast(msg.databaseSchema.success.sourceCloned, TOAST_TYPE.SUCCESS);
                return response.data || null;
            }
        } catch {
            addToast(msg.databaseSchema.error.cloneFailed, TOAST_TYPE.ERROR);
        } finally {
            setLoading(false);
        }
        return null;
    }, [addToast, api, msg, API_STATUS, TOAST_TYPE]);

    const archive = useCallback(async (id: string | number): Promise<boolean> => {
        setLoading(true);
        try {
            // ✅ Use api from context
            const response = await apiClient.delete(api.databaseSchema.archive?.(String(id)) || `${api.databaseSchema.list}/${id}/archive`);
            if (response.status === API_STATUS.SUCCESS) {
                // ✅ Use msg from context
                addToast(msg.databaseSchema.success.sourceArchived, TOAST_TYPE.SUCCESS);
                return true;
            }
        } catch {
            addToast(msg.databaseSchema.error.archiveFailed, TOAST_TYPE.ERROR);
        } finally {
            setLoading(false);
        }
        return false;
    }, [addToast, api, msg, API_STATUS, TOAST_TYPE]);

    const restore = useCallback(async (id: string | number): Promise<boolean> => {
        setLoading(true);
        try {
            // ✅ Use api from context
            const response = await apiClient.post(api.databaseSchema.restore?.(String(id)) || `${api.databaseSchema.list}/${id}/restore`);
            if (response.status === API_STATUS.SUCCESS) {
                // ✅ Use msg from context
                addToast(msg.databaseSchema.success.sourceRestored, TOAST_TYPE.SUCCESS);
                return true;
            }
        } catch {
            addToast(msg.databaseSchema.error.restoreFailed, TOAST_TYPE.ERROR);
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
