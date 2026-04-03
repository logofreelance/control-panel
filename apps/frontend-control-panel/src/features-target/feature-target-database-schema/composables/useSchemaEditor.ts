/**
 * database-schema/composables/useSchemaEditor.ts
 * 
 * Schema column operations (add/drop) with API calls
 * 
 * ✅ PURE DI: Uses useConfig() hook for all config, messages, and API
 */

'use client';

import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/frontend-api';
import { useToast, useConfig } from '@/modules/_core';
import type { ColumnDefinition } from '../types';

export interface UseSchemaEditorReturn {
    loading: boolean;
    addColumn: (column: ColumnDefinition) => Promise<boolean>;
    dropColumn: (columnName: string) => Promise<boolean>;
}

/**
 * Hook for schema column operations
 * Uses Pure DI via useConfig() hook
 */
export function useSchemaEditor(DatabaseTableId: number): UseSchemaEditorReturn {
    // ✅ Pure DI: Get all dependencies from context
    const { msg, api, API_STATUS, TOAST_TYPE } = useConfig();
    const { addToast } = useToast();
    const [loading, setLoading] = useState(false);

    const addColumn = useCallback(async (column: ColumnDefinition): Promise<boolean> => {
        setLoading(true);
        try {
            // ✅ Use api from context
            const response = await apiClient.post(api.databaseSchema.addColumn(DatabaseTableId), column);
            if (response.status === API_STATUS.SUCCESS) {
                // ✅ Use msg from context
                addToast(msg.databaseSchema.success.columnAdded, TOAST_TYPE.SUCCESS);
                return true;
            } else {
                addToast((response as { message?: string }).message || msg.databaseSchema.error.schemaFailed, TOAST_TYPE.ERROR);
            }
        } catch {
            addToast(msg.databaseSchema.error.schemaFailed, TOAST_TYPE.ERROR);
        } finally {
            setLoading(false);
        }
        return false;
    }, [DatabaseTableId, addToast, api, msg, API_STATUS, TOAST_TYPE]);

    const dropColumn = useCallback(async (columnName: string): Promise<boolean> => {
        setLoading(true);
        try {
            // ✅ Use api from context
            const response = await apiClient.delete(api.databaseSchema.dropColumn(DatabaseTableId, columnName));
            if (response.status === API_STATUS.SUCCESS) {
                // ✅ Use msg from context
                addToast(msg.databaseSchema.success.columnDropped, TOAST_TYPE.SUCCESS);
                return true;
            } else {
                addToast((response as { message?: string }).message || msg.databaseSchema.error.schemaFailed, TOAST_TYPE.ERROR);
            }
        } catch {
            addToast(msg.databaseSchema.error.schemaFailed, TOAST_TYPE.ERROR);
        } finally {
            setLoading(false);
        }
        return false;
    }, [DatabaseTableId, addToast, api, msg, API_STATUS, TOAST_TYPE]);

    return {
        loading,
        addColumn,
        dropColumn,
    };
}
