/**
 * data-sources/composables/useResourceSubmit.ts
 * 
 * Resource form submission (create/update)
 * 
 * ✅ PURE DI: Uses useConfig() hook for all config, messages, and API
 */

'use client';

import { useState, useCallback } from 'react';
import { apiClient } from '@cp/frontend-api';
import { useToast, useConfig } from '@/modules/_core';
import type { Resource, DataSource } from '../types';

export interface ResourcePayload {
    data_source_id: number;
    name: string;
    slug: string;
    description?: string;
    fields_json: string;
    order_by: string;
    order_direction: 'ASC' | 'DESC';
    default_limit: number;
    is_public: boolean;
    is_active?: boolean;
    aggregates_json?: string;
    computed_json?: string;
    filters_json?: string;
    joins_json?: string;
    relations_json?: string;
}

/**
 * Hook for submitting resource create/update
 * Uses Pure DI via useConfig() hook
 */
export function useResourceSubmit(dataSourceId: number) {
    // ✅ Pure DI: Get all dependencies from context
    const { msg, api, API_STATUS, TOAST_TYPE } = useConfig();
    const { addToast } = useToast();
    const [submitting, setSubmitting] = useState(false);

    // Validate payload before submit
    const validate = useCallback((name: string, slug: string): string[] => {
        const errors: string[] = [];
        // ✅ Use msg from context
        if (!name.trim()) errors.push(msg.dataSources.validation.resourceNameRequired);
        if (!slug.trim()) errors.push(msg.dataSources.validation.slugRequired);
        return errors;
    }, [msg]);

    // Create resource
    const create = useCallback(async (payload: ResourcePayload): Promise<Resource | null> => {
        const errors = validate(payload.name, payload.slug);
        if (errors.length > 0) {
            errors.forEach(err => addToast(err, TOAST_TYPE.ERROR));
            return null;
        }

        setSubmitting(true);
        try {
            // ✅ Use api from context
            const response = await apiClient.post<Resource>(
                api.dataSources.resources(dataSourceId),
                { ...payload, is_active: true }
            );
            if (response.status === API_STATUS.SUCCESS && response.data) {
                // ✅ Use msg from context
                addToast(msg.dataSources.success.resourceCreated, TOAST_TYPE.SUCCESS);
                return response.data;
            } else {
                addToast((response as { message?: string }).message || msg.error.generic, TOAST_TYPE.ERROR);
            }
        } catch {
            addToast(msg.error.network, TOAST_TYPE.ERROR);
        } finally {
            setSubmitting(false);
        }
        return null;
    }, [dataSourceId, validate, addToast, api, msg, API_STATUS, TOAST_TYPE]);

    // Update resource
    const update = useCallback(async (resourceId: number, payload: ResourcePayload): Promise<Resource | null> => {
        const errors = validate(payload.name, payload.slug);
        if (errors.length > 0) {
            errors.forEach(err => addToast(err, TOAST_TYPE.ERROR));
            return null;
        }

        setSubmitting(true);
        try {
            // ✅ Use api from context
            const response = await apiClient.put<Resource>(
                `${api.dataSources.resources(dataSourceId)}/${resourceId}`,
                payload
            );
            if (response.status === API_STATUS.SUCCESS && response.data) {
                // ✅ Use msg from context
                addToast(msg.dataSources.success.resourceUpdated, TOAST_TYPE.SUCCESS);
                return response.data;
            } else {
                addToast((response as { message?: string }).message || msg.dataSources.error.resourceUpdateFailed, TOAST_TYPE.ERROR);
            }
        } catch {
            addToast(msg.error.network, TOAST_TYPE.ERROR);
        } finally {
            setSubmitting(false);
        }
        return null;
    }, [dataSourceId, validate, addToast, api, msg, API_STATUS, TOAST_TYPE]);

    // Fetch available data sources for joins (excluding current)
    const fetchAvailableSources = useCallback(async (excludeId?: number): Promise<DataSource[]> => {
        try {
            // ✅ Use api from context
            const response = await apiClient.get<DataSource[]>(api.dataSources.list);
            if (response.status === API_STATUS.SUCCESS && response.data) {
                const sources = response.data;

                // Add System Users Mock (if not present)
                // This is needed for "Related Data" column selection for relations targeting "users"
                if (!sources.some(s => s.id === 0)) {
                    sources.push({
                        id: 0,
                        name: 'System Users', // Should use label but this is mock
                        tableName: 'users',
                        isSystem: true,
                        schema: {
                            columns: [
                                { name: 'id', type: 'integer' },
                                { name: 'email', type: 'string' },
                                { name: 'username', type: 'string' },
                                { name: 'role', type: 'string' },
                                { name: 'created_at', type: 'timestamp' },
                                { name: 'updated_at', type: 'timestamp' }
                            ]
                        }
                    });
                }

                return excludeId
                    ? sources.filter(ds => ds.id !== excludeId)
                    : sources;
            }
        } catch (err) {
            console.error('Failed to fetch sources:', err);
        }
        return [];
    }, [api, API_STATUS]);

    return {
        submitting,
        validate,
        create,
        update,
        fetchAvailableSources,
    };
}
