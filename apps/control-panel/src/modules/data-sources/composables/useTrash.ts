import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '@cp/frontend-api';
import { useToast, useConfig } from '@/modules/_core';
import type { DataSource } from '../types';

export function useTrash() {
    const { msg, api, API_STATUS, TOAST_TYPE } = useConfig();
    const { addToast } = useToast();
    const [items, setItems] = useState<DataSource[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTrash = useCallback(async () => {
        setLoading(true);
        try {
            const response = await apiClient.get<DataSource[]>(`${api.dataSources.list}?archived=true`);
            if (response.status === API_STATUS.SUCCESS) {
                setItems(response.data || []);
            }
        } catch {
            addToast(msg.dataSources.error.loadFailed, TOAST_TYPE.ERROR);
        } finally {
            setLoading(false);
        }
    }, [api, API_STATUS, msg, TOAST_TYPE, addToast]);

    useEffect(() => {
        fetchTrash();
    }, [fetchTrash]);

    const restore = useCallback(async (id: number) => {
        try {
            const response = await apiClient.post(api.dataSources.restore(id));
            if (response.status === API_STATUS.SUCCESS) {
                addToast(msg.dataSources.success.sourceRestored, TOAST_TYPE.SUCCESS);
                fetchTrash();
                return true;
            }
        } catch {
            addToast(msg.dataSources.error.restoreFailed, TOAST_TYPE.ERROR);
        }
        return false;
    }, [api, API_STATUS, msg, TOAST_TYPE, addToast, fetchTrash]);

    const destroy = useCallback(async (id: number) => {
        try {
            // Using logic from backend routes: DELETE /:id/destroy
            const response = await apiClient.delete(`${api.dataSources.list}/${id}/destroy`);
            if (response.status === API_STATUS.SUCCESS) {
                addToast(msg.dataSources.success.sourceDeleted, TOAST_TYPE.SUCCESS); // Use generic delete message or specific if available
                fetchTrash();
                return true;
            }
        } catch {
            addToast(msg.dataSources.error.archiveFailed, TOAST_TYPE.ERROR);
        }
        return false;
    }, [api, API_STATUS, msg, TOAST_TYPE, addToast, fetchTrash]);

    return {
        items,
        loading,
        fetchTrash,
        restore,
        destroy
    };
}
