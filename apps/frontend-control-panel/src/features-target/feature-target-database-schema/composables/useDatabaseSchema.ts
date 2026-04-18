/**
 * database-schema/composables/usedatabaseSchema.ts
 * 
 * CRUD hook for data sources using @repo/frontend-api
 * 
 * ✅ PURE DI: Uses useConfig() hook for all config, messages, and API
 */

'use client';

import { useState, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useCrud, apiClient } from '@/lib/frontend-api';
import { useToast } from '@/modules/_core';
import { API } from '../api/endpoints';
import { FEATURE_MESSAGES } from '../constants';
import { TOAST_TYPE } from '@/lib/config/defaults'; // Minimal infrastructure import
import type { DatabaseTable } from '../types';

/**
 * Extended database schema hook with additional actions
 * Modularized: Uses local FEATURE_MESSAGES and internal API
 */
export function useDatabaseSchema() {
    const { addToast } = useToast();
    const params = useParams();
    const targetId = params?.id as string;
    
    // Create headers memoized
    const headers = useMemo(() => targetId ? { 'x-target-id': targetId } : undefined, [targetId]);

    // ✅ Use Internal API Endpoints directly
    const endpoints = useMemo(() => ({
        list: API.list,
        create: API.save,
        detail: (id: string | number) => API.detail(id),
        update: (id: string | number) => API.update(id),
        delete: (id: string | number) => API.delete(id),
    }), []);

    // ✅ Memoize Callbacks to prevent infinite loops in useCrud useEffect
    const handleSuccess = useCallback((action: any) => {
        const messages: Record<string, string> = {
            create: FEATURE_MESSAGES.success.sourceCreated,
            delete: FEATURE_MESSAGES.success.sourceDeleted,
        };
        if (messages[action]) {
            addToast(messages[action], TOAST_TYPE.SUCCESS);
        }
    }, [addToast]);

    const handleError = useCallback((error: any) => {
        addToast(error.message || FEATURE_MESSAGES.error.loadFailed, TOAST_TYPE.ERROR);
    }, [addToast]);

    // ✅ Memoize Options object
    const options = useMemo(() => ({
        onSuccess: handleSuccess,
        onError: handleError,
        headers,
    }), [handleSuccess, handleError, headers]);

    // ✅ Call useCrud with stable options
    const crud = useCrud<DatabaseTable>(endpoints, options);

    return crud;
}

/**
 * Additional database schema actions (clone, archive, etc.)
 * Uses Pure DI via useConfig() hook
 */
export function useSchemaActions() {
    const { addToast } = useToast();
    const [loading, setLoading] = useState(false);
    const params = useParams();
    const targetId = params?.id as string;
    const getHeaders = useCallback(() => {
        const h: Record<string, string> = {};
        if (targetId) h['x-target-id'] = String(targetId);
        return h;
    }, [targetId]);

    const clone = useCallback(async (id: string | number): Promise<DatabaseTable | null> => {
        setLoading(true);
        try {
            // ✅ Use Internal API
            const response = await apiClient.post<DatabaseTable>(`${API.list}/${id}/clone`, undefined, { headers: getHeaders() });
            if (response.status === 'success') {
                addToast(FEATURE_MESSAGES.success.sourceCloned, TOAST_TYPE.SUCCESS);
                return response.data || null;
            }
        } catch {
            addToast(FEATURE_MESSAGES.error.cloneFailed, TOAST_TYPE.ERROR);
        } finally {
            setLoading(false);
        }
        return null;
    }, [addToast, getHeaders]);

    const archive = useCallback(async (id: string | number): Promise<boolean> => {
        setLoading(true);
        try {
            // ✅ Use Internal API
            const response = await apiClient.delete(API.delete(id), { headers: getHeaders() });
            if (response.status === 'success') {
                addToast(FEATURE_MESSAGES.success.sourceArchived, TOAST_TYPE.SUCCESS);
                return true;
            }
        } catch {
            addToast(FEATURE_MESSAGES.error.archiveFailed, TOAST_TYPE.ERROR);
        } finally {
            setLoading(false);
        }
        return false;
    }, [addToast, getHeaders]);

    const restore = useCallback(async (id: string | number): Promise<boolean> => {
        setLoading(true);
        try {
            // ✅ Use Internal API
            const response = await apiClient.post(API.restore?.(id) || `${API.list}/${id}/restore`, undefined, { headers: getHeaders() });
            if (response.status === 'success') {
                addToast(FEATURE_MESSAGES.success.sourceRestored, TOAST_TYPE.SUCCESS);
                return true;
            }
        } catch {
            addToast(FEATURE_MESSAGES.error.restoreFailed, TOAST_TYPE.ERROR);
        } finally {
            setLoading(false);
        }
        return false;
    }, [addToast, getHeaders]);

    return {
        loading,
        clone,
        archive,
        restore,
    };
}
