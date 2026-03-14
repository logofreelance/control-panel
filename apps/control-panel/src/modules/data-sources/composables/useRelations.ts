/**
 * data-sources/composables/useRelations.ts
 * 
 * Relations management composable (CRUD for data source relations)
 * 
 * ✅ PURE DI: Uses useConfig() hook for all config, messages, and API
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '@cp/frontend-api';
import { useToast, useConfig } from '@/modules/_core';

export interface Relation {
    id: number;
    sourceId: number;
    targetId: number;
    type: 'belongs_to' | 'has_one' | 'has_many' | 'many_to_many';
    localKey: string | null;
    foreignKey: string;
    pivotTable: string | null;
    alias: string;
    target?: {
        name: string;
        tableName: string;
    };
}

export interface RelationTarget {
    id: number;
    name: string;
    tableName: string;
}

export interface AddRelationPayload {
    targetId: number;
    type: Relation['type'];
    alias?: string;
}

/**
 * Hook for managing data source relations
 * Uses Pure DI via useConfig() hook
 */
export function useRelations(dataSourceId: number) {
    // ✅ Pure DI: Get all dependencies from context
    const { msg, api, API_STATUS, TOAST_TYPE } = useConfig();
    const { addToast } = useToast();

    const [relations, setRelations] = useState<Relation[]>([]);
    const [targets, setTargets] = useState<RelationTarget[]>([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // Fetch relations
    const fetchRelations = useCallback(async () => {
        try {
            // ✅ Use api from context
            const response = await apiClient.get<Relation[]>(api.dataSources.relations(dataSourceId));
            if (response.status === API_STATUS.SUCCESS && response.data) {
                setRelations(response.data);
            }
        } catch (err) {
            console.error('Failed to fetch relations:', err);
        }
    }, [dataSourceId, api, API_STATUS]);

    // Fetch available targets
    const fetchTargets = useCallback(async () => {
        try {
            // ✅ Use api from context
            const response = await apiClient.get<RelationTarget[]>(api.dataSources.availableTargets(dataSourceId));
            if (response.status === API_STATUS.SUCCESS && response.data) {
                setTargets(response.data);
            }
        } catch (err) {
            console.error('Failed to fetch targets:', err);
        }
    }, [dataSourceId, api, API_STATUS]);

    // Initial load
    useEffect(() => {
        const init = async () => {
            setLoading(true);
            await Promise.all([fetchRelations(), fetchTargets()]);
            setLoading(false);
        };
        init();
    }, [fetchRelations, fetchTargets]);

    // Add relation
    const addRelation = useCallback(async (payload: AddRelationPayload): Promise<Relation | null> => {
        if (payload.targetId === undefined || payload.targetId === null || Number.isNaN(payload.targetId)) {
            // ✅ Use msg from context
            addToast(msg.dataSources.validation.selectTargetTable, TOAST_TYPE.ERROR);
            return null;
        }

        setAdding(true);
        try {
            // ✅ Use api from context
            const response = await apiClient.post<Relation>(api.dataSources.addRelation(dataSourceId), payload);
            // ✅ Log response for debug
            // ✅ Log response for debug - removed for production build

            if (response.status === API_STATUS.SUCCESS) {
                addToast(msg.dataSources.success.relationAdded, TOAST_TYPE.SUCCESS);
                await fetchRelations();
                return response.data || null; // Return data only
            } else {
                addToast((response as { message?: string }).message || msg.dataSources.error.relationFailed, TOAST_TYPE.ERROR);
            }
        } catch {
            addToast(msg.error.network, TOAST_TYPE.ERROR);
        } finally {
            setAdding(false);
        }
        return null;
    }, [dataSourceId, fetchRelations, addToast, api, msg, API_STATUS, TOAST_TYPE]);

    // Delete relation
    const deleteRelation = useCallback(async (relationId: string | number): Promise<boolean> => {
        setDeleting(true);
        try {
            // ✅ Use api from context
            // Ensure relationId is handled correctly (backend may expect string or number depending on route)
            const response = await apiClient.delete(api.dataSources.deleteRelation(dataSourceId, Number(relationId)));
            if (response.status === API_STATUS.SUCCESS) {
                addToast(msg.dataSources.success.relationDeleted, TOAST_TYPE.SUCCESS);
                await fetchRelations();
                return true;
            } else {
                addToast((response as { message?: string }).message || msg.dataSources.error.relationFailed, TOAST_TYPE.ERROR);
            }
        } catch {
            addToast(msg.error.network, TOAST_TYPE.ERROR);
        } finally {
            setDeleting(false);
        }
        return false;
    }, [dataSourceId, fetchRelations, addToast, api, msg, API_STATUS, TOAST_TYPE]);

    // Update relation
    const updateRelation = useCallback(async (relationId: string | number, payload: { alias?: string, type?: string }): Promise<boolean> => {
        try {
            // Ensure relationId is passed correctly
            const response = await apiClient.put(api.dataSources.updateRelation(dataSourceId, Number(relationId)), payload);
            if (response.status === API_STATUS.SUCCESS) {
                addToast(msg.dataSources.success.relationUpdated || "Relation updated", TOAST_TYPE.SUCCESS);
                await fetchRelations();
                return true;
            } else {
                addToast((response as { message?: string }).message || msg.dataSources.error.relationFailed, TOAST_TYPE.ERROR);
            }
        } catch {
            addToast(msg.error.network, TOAST_TYPE.ERROR);
        }
        return false;
    }, [dataSourceId, fetchRelations, addToast, api, msg, API_STATUS, TOAST_TYPE]);

    return {
        // State
        relations,
        targets,
        loading,
        adding,
        deleting,

        // Actions
        fetchRelations,
        fetchTargets,
        addRelation,
        deleteRelation,
        updateRelation,
    };
}
