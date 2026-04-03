/**
 * database-schema/composables/useDataViewer.ts
 * 
 * Data viewer operations (CRUD rows, import, pagination)
 * 
 * ✅ PURE DI: Uses useConfig() hook for all config, messages, and API
 */

'use client';

import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/frontend-api';
import { usePagination, useSorting, useSelection } from '@/lib/frontend-table';
import { useToast, useConfig } from '@/modules/_core';

export interface UseDataViewerOptions {
    defaultLimit?: number;
}

/**
 * Hook for managing data viewer operations
 * Uses Pure DI via useConfig() hook
 */
export function useDataViewer(DatabaseTableId: number, options: UseDataViewerOptions = {}) {
    // ✅ Pure DI: Get all dependencies from context
    const { msg, defaults, api, API_STATUS, TOAST_TYPE } = useConfig();
    const { addToast } = useToast();

    const { defaultLimit = defaults.databaseSchema.dataViewer.limit } = options;

    const [rows, setRows] = useState<Record<string, unknown>[]>([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);

    // Pagination from @repo/frontend-table
    const pagination = usePagination({
        initialPage: 1,
        initialLimit: defaultLimit,
        total,
    });

    // Sorting from @repo/frontend-table (using defaults from config)
    const sorting = useSorting({
        initialColumn: 'id',
        initialDirection: defaults.sortOrder,
    });

    // Selection from @repo/frontend-table
    const selection = useSelection<Record<string, unknown>>({
        idKey: 'id',
    });

    // Fetch data
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: String(pagination.page),
                limit: String(pagination.limit),
                sortBy: sorting.sortColumn || 'id',
                sortDir: sorting.sortDirection,
            });

            // ✅ Use api from context
            const response = await apiClient.get<{
                data: Record<string, unknown>[];
                total: number;
            }>(`${api.databaseSchema.data(DatabaseTableId)}?${params}`);

            if (response.status === API_STATUS.SUCCESS && response.data) {
                setRows(response.data.data || []);
                setTotal(response.data.total || 0);
                pagination.setTotal(response.data.total || 0);
            }
        } catch {
            // ✅ Use msg from context
            addToast(msg.databaseSchema.error.dataLoadFailed, TOAST_TYPE.ERROR);
        } finally {
            setLoading(false);
        }
    }, [DatabaseTableId, pagination, sorting.sortColumn, sorting.sortDirection, addToast, api, msg, API_STATUS, TOAST_TYPE]);

    // Insert row
    const insertRow = useCallback(async (data: Record<string, unknown>): Promise<boolean> => {
        try {
            // ✅ Use api from context
            const response = await apiClient.post(api.databaseSchema.insertRow(DatabaseTableId), data);
            if (response.status === API_STATUS.SUCCESS) {
                // ✅ Use msg from context
                addToast(msg.databaseSchema.success.rowInserted, TOAST_TYPE.SUCCESS);
                await fetchData();
                return true;
            }
        } catch {
            addToast(msg.databaseSchema.error.rowInsertFailed, TOAST_TYPE.ERROR);
        }
        return false;
    }, [DatabaseTableId, fetchData, addToast, api, msg, API_STATUS, TOAST_TYPE]);

    // Update row
    const updateRow = useCallback(async (
        rowId: number,
        data: Record<string, unknown>
    ): Promise<boolean> => {
        try {
            // ✅ Use api from context
            const response = await apiClient.put(api.databaseSchema.updateRow(DatabaseTableId, rowId), data);
            if (response.status === API_STATUS.SUCCESS) {
                // ✅ Use msg from context
                addToast(msg.databaseSchema.success.rowUpdated, TOAST_TYPE.SUCCESS);
                await fetchData();
                return true;
            }
        } catch {
            addToast(msg.databaseSchema.error.rowUpdateFailed, TOAST_TYPE.ERROR);
        }
        return false;
    }, [DatabaseTableId, fetchData, addToast, api, msg, API_STATUS, TOAST_TYPE]);

    // Delete row
    const deleteRow = useCallback(async (rowId: number): Promise<boolean> => {
        try {
            // ✅ Use api from context
            const response = await apiClient.delete(api.databaseSchema.deleteRow(DatabaseTableId, rowId));
            if (response.status === API_STATUS.SUCCESS) {
                // ✅ Use msg from context
                addToast(msg.databaseSchema.success.rowDeleted, TOAST_TYPE.SUCCESS);
                await fetchData();
                return true;
            }
        } catch {
            addToast(msg.databaseSchema.error.rowDeleteFailed, TOAST_TYPE.ERROR);
        }
        return false;
    }, [DatabaseTableId, fetchData, addToast, api, msg, API_STATUS, TOAST_TYPE]);

    // Delete selected rows
    const deleteSelected = useCallback(async (): Promise<boolean> => {
        const ids = selection.selectedIds;
        if (ids.length === 0) return false;

        let success = 0;
        for (const id of ids) {
            const deleted = await deleteRow(Number(id));
            if (deleted) success++;
        }

        if (success > 0) {
            selection.deselectAll();
            // ✅ Use msg from context
            addToast(msg.databaseSchema.success.rowsDeleted(success), TOAST_TYPE.SUCCESS);
        }
        return success === ids.length;
    }, [selection, deleteRow, addToast, msg, TOAST_TYPE]);

    return {
        // Data
        rows,
        loading,
        total,

        // Pagination
        pagination,

        // Sorting
        sorting,

        // Selection
        selection,

        // Actions
        fetchData,
        insertRow,
        updateRow,
        deleteRow,
        deleteSelected,
    };
}
