/**
 * database-schema/composables/useImportData.ts
 * 
 * Bulk import data composable
 * 
 * ✅ PURE DI: Uses useConfig() hook for all config, messages, and API
 */

'use client';

import { useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { apiClient } from '@/lib/frontend-api';
import { useToast } from '@/modules/_core';
import { API } from '../api/endpoints';
import { TOAST_TYPE, API_STATUS } from '@/lib/config/defaults';

export interface UseImportDataReturn {
    importing: boolean;
    error: string | null;
    importData: (jsonData: unknown[]) => Promise<boolean>;
}

/**
 * Hook for bulk importing data into a data source
 * Modularized: Uses internal API and local constants
 */
export function useImportData(DatabaseTableId: string | number): UseImportDataReturn {
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

    const [importing, setImporting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const importData = useCallback(async (jsonData: unknown[]): Promise<boolean> => {
        setError(null);
        setImporting(true);

        try {
            if (!Array.isArray(jsonData)) {
                throw new Error('Input must be an array of objects');
            }

            const response = await apiClient.post(
                `${API.data(DatabaseTableId)}/bulk`,
                jsonData,
                { headers: getHeaders() }
            );

            if (response.status === API_STATUS.SUCCESS) {
                addToast((response as { message?: string }).message || 'Data imported successfully', TOAST_TYPE.SUCCESS);
                return true;
            } else {
                throw new Error((response as { message?: string }).message || 'Import failed');
            }
        } catch (err) {
            console.error('Import error:', err);
            const errorMessage = (err instanceof Error ? err.message : String(err)) || 'Network error occurred';
            setError(errorMessage);
            addToast(errorMessage, TOAST_TYPE.ERROR);
            return false;
        } finally {
            setImporting(false);
        }
    }, [DatabaseTableId, addToast, getHeaders]);

    return {
        importing,
        error,
        importData,
    };
}
