import { useState, useCallback, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { apiClient } from '@/lib/frontend-api';
import { useToast } from '@/modules/_core';
import { API } from '../api/endpoints';
import { FEATURE_MESSAGES } from '../constants';
import { TOAST_TYPE, API_STATUS } from '@/lib/config/defaults';
import type { DatabaseTable } from '../types';

/**
 * Hook for managing trashed database schemas
 * Modularized: Uses internal API and local FEATURE_MESSAGES
 */
export function useTrash() {
    const { addToast } = useToast();
    const params = useParams();
    
    // Resolve target ID for x-target-id header
    const rawNodeId = Array.isArray(params.id) ? params.id[0] : params.id;
    const targetId = rawNodeId;
    
    // ✅ Memoize headers to prevent infinite loops
    const headers = useMemo((): Record<string, string> => {
        const h: Record<string, string> = {};
        if (targetId) h['x-target-id'] = String(targetId);
        return h;
    }, [targetId]);

    const [items, setItems] = useState<DatabaseTable[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTrash = useCallback(async () => {
        setLoading(true);
        try {
            const response = await apiClient.get<DatabaseTable[]>(`${API.list}?archived=true`, { headers });
            if (response.status === API_STATUS.SUCCESS) {
                setItems(response.data || []);
            }
        } catch {
            addToast(FEATURE_MESSAGES.error.loadFailed, TOAST_TYPE.ERROR);
        } finally {
            setLoading(false);
        }
    }, [addToast, headers]);

    useEffect(() => {
        fetchTrash();
    }, [fetchTrash]);

    const restore = useCallback(async (id: string | number) => {
        try {
            const response = await apiClient.post(API.restore(id), undefined, { headers });
            if (response.status === API_STATUS.SUCCESS) {
                addToast(FEATURE_MESSAGES.success.sourceRestored, TOAST_TYPE.SUCCESS);
                fetchTrash();
                return true;
            }
        } catch {
            addToast(FEATURE_MESSAGES.error.restoreFailed, TOAST_TYPE.ERROR);
        }
        return false;
    }, [addToast, fetchTrash, headers]);

    const destroy = useCallback(async (id: string | number) => {
        try {
            const response = await apiClient.delete(API.destroy(id), { headers });
            if (response.status === API_STATUS.SUCCESS) {
                addToast(FEATURE_MESSAGES.success.sourceDeleted, TOAST_TYPE.SUCCESS);
                fetchTrash();
                return true;
            }
        } catch {
            addToast(FEATURE_MESSAGES.error.archiveFailed, TOAST_TYPE.ERROR);
        }
        return false;
    }, [addToast, fetchTrash, headers]);

    return {
        items,
        loading,
        fetchTrash,
        restore,
        destroy
    };
}
