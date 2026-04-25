/**
 * database-schema/composables/useDataViewer.ts
 *
 * Data viewer operations (CRUD rows, import, pagination)
 *
 * ✅ PURE DI: Uses useConfig() hook for all config, messages, and API
 */

'use client';

import { useState, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { apiClient } from '@/lib/frontend-api';
import { usePagination, useSorting, useSelection } from '@/lib/frontend-table';
import { useToast } from '@/modules/_core';
import { API } from '../api/endpoints';
import { FEATURE_MESSAGES } from '../constants';
import { TOAST_TYPE, API_STATUS, DEFAULTS } from '@/lib/config/defaults';

export interface UseDataViewerOptions {
  defaultLimit?: number;
}

/**
 * Hook for managing data viewer operations
 * Modularized: Uses internal API and local FEATURE_MESSAGES
 */
export function useDataViewer(DatabaseTableId: string | number, options: UseDataViewerOptions = {}) {
  const { addToast } = useToast();
  const params = useParams();

  // Resolve target ID for x-target-id header
  const rawTableId = Array.isArray(params.tableId) ? params.tableId[0] : params.tableId;
  const rawNodeId = Array.isArray(params.id) ? params.id[0] : params.id;
  const targetId = rawTableId ? rawNodeId : undefined;
  const getHeaders = useCallback(() => {
    const h: Record<string, string> = {};
    if (targetId) h['x-target-id'] = String(Array.isArray(targetId) ? targetId[0] : targetId);
    return h;
  }, [targetId]);

  const { defaultLimit = DEFAULTS.databaseSchema.dataViewer.limit } = options;

  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [columns, setColumns] = useState<any[]>([]); // New physical columns state
  const [loading, setLoading] = useState(false);
  const fetchRef = useRef(false);
  const [total, setTotal] = useState(0);

  // Pagination from @repo/frontend-table
  const pagination = usePagination({
    initialPage: 1,
    initialLimit: defaultLimit,
    total,
  });

  // Sorting from @repo/frontend-table
  const sorting = useSorting({
    initialColumn: 'id',
    initialDirection: 'DESC',
  });

  // Selection from @repo/frontend-table
  const selection = useSelection<Record<string, unknown>>({
    idKey: 'id',
  });

  // Fetch data
  const fetchData = useCallback(async () => {
    if (fetchRef.current) return; // Prevent concurrent requests
    
    fetchRef.current = true;
    setLoading(true);
    try {
      const searchParams = new URLSearchParams({
        page: String(pagination.page || 1),
        limit: String(pagination.limit || 10),
        sortBy: sorting.sortColumn || 'id',
        sortDir: sorting.sortDirection || 'DESC',
      });

      const response = await apiClient.get<{
        data: Record<string, unknown>[];
        total: number;
      }>(`${API.pageDataViewer.rows(String(DatabaseTableId))}?${searchParams}`, { 
        headers: getHeaders(),
        transformResponse: false 
      } as any);

      if (response.status === API_STATUS.SUCCESS && response.data) {
        setRows(response.data.data || []);
        setTotal(response.data.total || 0);
        pagination.setTotal(response.data.total || 0);
        
        // Fetch columns if not available
        if (columns.length === 0) {
            const colRes = await apiClient.get<any[]>(API.pageDataViewer.columns(String(DatabaseTableId)), { 
              headers: getHeaders(),
              transformResponse: false
            } as any);
            if (colRes.status === API_STATUS.SUCCESS && colRes.data) {
                setColumns(colRes.data);
            }
        }
      }
    } catch (e) {
      console.error("Data fetch failed", e);
      addToast(FEATURE_MESSAGES.error.dataLoadFailed, TOAST_TYPE.ERROR);
    } finally {
      fetchRef.current = false;
      setLoading(false);
    }
  }, [
    DatabaseTableId,
    pagination.page,
    pagination.limit,
    sorting.sortColumn,
    sorting.sortDirection,
    getHeaders,
    addToast,
    columns.length,
  ]);

  // Insert row
  const insertRow = useCallback(
    async (data: Record<string, unknown>): Promise<boolean> => {
      try {
        const response = await apiClient.post(API.pageDataViewer.insertRow(String(DatabaseTableId)), data, { headers: getHeaders(), transformRequest: false });
        if (response.status === API_STATUS.SUCCESS) {
          addToast(FEATURE_MESSAGES.success.rowInserted, TOAST_TYPE.SUCCESS);
          await fetchData();
          return true;
        }
      } catch {
        addToast(FEATURE_MESSAGES.error.rowInsertFailed, TOAST_TYPE.ERROR);
      }
      return false;
    },
    [DatabaseTableId, fetchData, addToast, getHeaders],
  );

  // Update row
  const updateRow = useCallback(
    async (rowId: number, data: Record<string, unknown>): Promise<boolean> => {
      try {
        const response = await apiClient.put(
          API.pageDataViewer.updateRow(String(DatabaseTableId), String(rowId)),
          data,
          { headers: getHeaders(), transformRequest: false },
        );
        if (response.status === API_STATUS.SUCCESS) {
          addToast(FEATURE_MESSAGES.success.rowUpdated, TOAST_TYPE.SUCCESS);
          await fetchData();
          return true;
        }
      } catch {
        addToast(FEATURE_MESSAGES.error.rowUpdateFailed, TOAST_TYPE.ERROR);
      }
      return false;
    },
    [DatabaseTableId, fetchData, addToast, getHeaders],
  );

  // Delete row
  const deleteRow = useCallback(
    async (rowId: number, skipFetch?: boolean): Promise<boolean> => {
      try {
        const response = await apiClient.delete(
          API.pageDataViewer.deleteRow(String(DatabaseTableId), String(rowId)),
          { headers: getHeaders() },
        );
        if (response.status === API_STATUS.SUCCESS) {
          addToast(FEATURE_MESSAGES.success.rowDeleted, TOAST_TYPE.SUCCESS);
          if (!skipFetch) await fetchData();
          return true;
        }
      } catch {
        addToast(FEATURE_MESSAGES.error.rowDeleteFailed, TOAST_TYPE.ERROR);
      }
      return false;
    },
    [DatabaseTableId, fetchData, addToast, getHeaders],
  );

  // Delete selected rows
  const deleteSelected = useCallback(async (): Promise<boolean> => {
    const ids = selection.selectedIds;
    if (ids.length === 0) return false;

    // Use Promise.allSettled with chunking to avoid overwhelming the server
    const batchSize = 10;
    const allIds = [...ids];
    let success = 0;

    for (let i = 0; i < allIds.length; i += batchSize) {
      const batch = allIds.slice(i, i + batchSize);
      const results = await Promise.allSettled(
        batch.map((id) => deleteRow(Number(id), true))
      );
      success += results.filter((r) => r.status === 'fulfilled' && r.value).length;
    }

    if (success > 0) {
      selection.deselectAll();
      addToast(FEATURE_MESSAGES.success.rowsDeleted(success), TOAST_TYPE.SUCCESS);
      await fetchData();
    }
    return success === ids.length;
  }, [selection, deleteRow, addToast, fetchData]);

  // Export data
  const exportData = useCallback(async () => {
    try {
      throw new Error('Export not yet implemented in BFF');
      // const response = await fetch(`${API.list}/${DatabaseTableId}/export?format=csv`, {
      //   headers: getHeaders(),
      // });
      // if (!response.ok) throw new Error('Export failed');
      // const blob = await response.blob();
      // const url = URL.createObjectURL(blob);
      // const a = document.createElement('a');
      // a.href = url;
      // a.download = `export-${DatabaseTableId}.csv`;
      // document.body.appendChild(a);
      // a.click();
      // document.body.removeChild(a);
      // URL.revokeObjectURL(url);
    } catch {
      addToast('Failed to export data', TOAST_TYPE.ERROR);
    }
  }, [DatabaseTableId, getHeaders, addToast]);

  return {
    // Data
    rows,
    columns, // Expose physical columns
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
    exportData,
    insertRow,
    updateRow,
    deleteRow,
    deleteSelected,
  };
}
