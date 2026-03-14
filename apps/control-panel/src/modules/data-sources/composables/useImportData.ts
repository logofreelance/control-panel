/**
 * data-sources/composables/useImportData.ts
 * 
 * Bulk import data composable
 * 
 * ✅ PURE DI: Uses useConfig() hook for all config, messages, and API
 */

'use client';

import { useState, useCallback } from 'react';
import { apiClient } from '@cp/frontend-api';
import { useToast, useConfig } from '@/modules/_core';

export interface UseImportDataReturn {
    importing: boolean;
    error: string | null;
    importData: (jsonData: unknown[]) => Promise<boolean>;
}

/**
 * Hook for bulk importing data into a data source
 * Uses Pure DI via useConfig() hook
 */
export function useImportData(dataSourceId: number): UseImportDataReturn {
    // ✅ Pure DI: Get all dependencies from context
    const { msg, api, API_STATUS, TOAST_TYPE } = useConfig();
    const { addToast } = useToast();

    const [importing, setImporting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const importData = useCallback(async (jsonData: unknown[]): Promise<boolean> => {
        setError(null);
        setImporting(true);

        try {
            if (!Array.isArray(jsonData)) {
                throw new Error('Input must be an array of objects');
            }

            // ✅ Use api from context
            const response = await apiClient.post(
                `${api.dataSources.data(dataSourceId)}/bulk`,
                jsonData
            );

            if (response.status === API_STATUS.SUCCESS) {
                // ✅ Use msg from context
                addToast((response as { message?: string }).message || msg.dataSources.success.dataImported, TOAST_TYPE.SUCCESS);
                return true;
            } else {
                throw new Error((response as { message?: string }).message || 'Import failed');
            }
        } catch (err) {
            console.error('Import error:', err);
            const errorMessage = (err instanceof Error ? err.message : String(err)) || msg.error.generic;
            setError(errorMessage);
            addToast(errorMessage, TOAST_TYPE.ERROR);
            return false;
        } finally {
            setImporting(false);
        }
    }, [dataSourceId, addToast, api, msg, API_STATUS, TOAST_TYPE]);

    return {
        importing,
        error,
        importData,
    };
}
