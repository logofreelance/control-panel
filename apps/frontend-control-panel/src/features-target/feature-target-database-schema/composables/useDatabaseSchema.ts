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
        list: API.pageSchemaList.schemas,
        create: '', // Unused in this page
        detail: (id: string | number) => API.pageSchemaEditor.detail(String(id)),
        update: (id: string | number) => API.pageSchemaEditor.update(String(id)),
        delete: (id: string | number) => API.pageSchemaList.archive(String(id)),
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
 * useDatabaseCategories - Categories management
 */
export function useDatabaseCategories() {
    const { addToast } = useToast();
    const params = useParams();
    const targetId = params?.id as string;
    
    // Create headers memoized
    const headers = useMemo(() => targetId ? { 'x-target-id': targetId } : undefined, [targetId]);

    const endpoints = useMemo(() => ({
        list: API.pageSchemaList.categories,
        create: API.pageSchemaList.categories,
        detail: (id: string | number) => API.pageSchemaList.categoryById(String(id)),
        update: (id: string | number) => API.pageSchemaList.categoryById(String(id)),
        delete: (id: string | number) => API.pageSchemaList.categoryById(String(id)),
    }), []);

    const handleSuccess = useCallback((action: any) => {
        const messages: Record<string, string> = {
            create: 'category created successfully',
            update: 'category updated successfully',
            delete: 'category deleted successfully',
        };
        if (messages[action]) {
            addToast(messages[action], TOAST_TYPE.SUCCESS);
        }
    }, [addToast]);

    const handleError = useCallback((error: any) => {
        addToast(error.message || 'category operation failed', TOAST_TYPE.ERROR);
    }, [addToast]);

    const options = useMemo(() => ({
        onSuccess: handleSuccess,
        onError: handleError,
        headers,
    }), [handleSuccess, handleError, headers]);

    return useCrud<import('../types').DatabaseCategory>(endpoints, options);
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
            const response = await apiClient.post<DatabaseTable>(`${API.pageSchemaList.schemas}/${id}/clone`, undefined, { headers: getHeaders() });
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
            const response = await apiClient.delete(API.pageSchemaList.archive(String(id)), { headers: getHeaders() });
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
            const response = await apiClient.post(API.pageSchemaTrash.restore(String(id)), undefined, { headers: getHeaders() });
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
