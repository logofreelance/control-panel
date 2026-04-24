/**
 * database-schema/composables/useSchemaEditor.ts
 * 
 * Schema column operations (add/drop) with API calls
 * 
 * ✅ PURE DI: Uses useConfig() hook for all config, messages, and API
 */

'use client';

import { useState, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { apiClient } from '@/lib/frontend-api';
import { useToast } from '@/modules/_core';
import { API } from '../api/endpoints';
import { FEATURE_MESSAGES } from '../constants';
import { TOAST_TYPE, API_STATUS } from '@/lib/config/defaults';
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
export function useSchemaEditor(DatabaseTableId: string | number): UseSchemaEditorReturn {
    // ❌ Removed useConfig() for local constants instead
    const { addToast } = useToast();
    const [loading, setLoading] = useState(false);
    
    // Resolve target ID for headers
    const params = useParams();
    const targetId = params?.id as string;
    const headers = useMemo((): Record<string, string> => {
        const h: Record<string, string> = {};
        if (targetId) h['x-target-id'] = String(targetId);
        return h;
    }, [targetId]);

    const addColumn = useCallback(async (column: ColumnDefinition): Promise<boolean> => {
        setLoading(true);
        try {
            const response = await apiClient.post(API.pageSchemaEditor.addColumn(String(DatabaseTableId)), column, { headers });
            if (response.status === API_STATUS.SUCCESS) {
                addToast('Column added successfully', TOAST_TYPE.SUCCESS);
                return true;
            } else {
                addToast((response as { message?: string }).message || 'Failed to update schema', TOAST_TYPE.ERROR);
            }
        } catch {
            addToast('Failed to update schema', TOAST_TYPE.ERROR);
        } finally {
            setLoading(false);
        }
        return false;
    }, [DatabaseTableId, addToast, headers]);

    const dropColumn = useCallback(async (columnName: string): Promise<boolean> => {
        setLoading(true);
        try {
            const response = await apiClient.delete(API.pageSchemaEditor.dropColumn(String(DatabaseTableId), columnName), { headers });
            if (response.status === API_STATUS.SUCCESS) {
                addToast('Column dropped successfully', TOAST_TYPE.SUCCESS);
                return true;
            } else {
                addToast((response as { message?: string }).message || 'Failed to update schema', TOAST_TYPE.ERROR);
            }
        } catch {
            addToast('Failed to update schema', TOAST_TYPE.ERROR);
        } finally {
            setLoading(false);
        }
        return false;
    }, [DatabaseTableId, addToast, headers]);

    return {
        loading,
        addColumn,
        dropColumn,
    };
}
