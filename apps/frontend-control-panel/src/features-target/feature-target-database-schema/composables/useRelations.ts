/**
 * database-schema/composables/useRelations.ts
 *
 * Relations management composable (CRUD for data source relations)
 *
 * ✅ PURE DI: Uses useConfig() hook for all config, messages, and API
 */

'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { apiClient } from '@/lib/frontend-api';
import { useToast } from '@/modules/_core';
import { API } from '../api/endpoints';
import { TOAST_TYPE, API_STATUS } from '@/lib/config/defaults';

export interface Relation {
  id: string | number;
  sourceId: string | number;
  targetId: string | number;
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
  id: string | number;
  name: string;
  tableName: string;
}

export interface AddRelationPayload {
  targetId: string | number;
  type: Relation['type'];
  localKey: string;
  foreignKey: string;
  alias?: string;
}

/**
 * Hook for managing data source relations
 * Modularized: Uses internal API and local FEATURE_MESSAGES
 */
export function useRelations(DatabaseTableId: string | number) {
  const { addToast } = useToast();
  const params = useParams();
  const rawNodeId = Array.isArray(params.id) ? params.id[0] : params.id;
  const targetId = rawNodeId;

  // ✅ Memoize headers
  const headers = useMemo((): Record<string, string> => {
    const h: Record<string, string> = {};
    if (targetId) h['x-target-id'] = String(Array.isArray(targetId) ? targetId[0] : targetId);
    return h;
  }, [targetId]);

  const [relations, setRelations] = useState<Relation[]>([]);
  const [targets, setTargets] = useState<RelationTarget[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Fetch relations
  const fetchRelations = useCallback(async () => {
    try {
      const response = await apiClient.get<Relation[]>(
        API.relations(DatabaseTableId),
        { headers }
      );
      if (response.status === API_STATUS.SUCCESS && response.data) {
        setRelations(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch relations:', err);
    }
  }, [DatabaseTableId, headers]);

  // Fetch available targets
  const fetchTargets = useCallback(async () => {
    try {
      const response = await apiClient.get<RelationTarget[]>(
        API.availableTargets(DatabaseTableId),
        { headers }
      );
      if (response.status === API_STATUS.SUCCESS && response.data) {
        setTargets(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch targets:', err);
    }
  }, [DatabaseTableId, headers]);

  // Fetch columns for any table
  const fetchColumns = useCallback(async (tableId: string | number) => {
    try {
      const response = await apiClient.get<any[]>(
        API.columns(tableId),
        { headers }
      );
      if (response.status === API_STATUS.SUCCESS && response.data) {
        return response.data;
      }
    } catch (err) {
      console.error('Failed to fetch columns:', err);
    }
    return [];
  }, [headers]);

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
  const addRelation = useCallback(
    async (payload: AddRelationPayload): Promise<Relation | null> => {
      if (
        payload.targetId === undefined ||
        payload.targetId === null ||
        (typeof payload.targetId === 'number' && Number.isNaN(payload.targetId))
      ) {
        addToast('Please select a target table', TOAST_TYPE.ERROR);
        return null;
      }

      setAdding(true);
      try {
        const response = await apiClient.post<Relation>(
          API.addRelation(DatabaseTableId),
          payload,
          { headers }
        );

        if (response.status === API_STATUS.SUCCESS) {
          addToast('Relation added successfully', TOAST_TYPE.SUCCESS);
          await fetchRelations();
          return response.data || null;
        } else {
          addToast(
            (response as { message?: string }).message || 'Failed to add relation',
            TOAST_TYPE.ERROR,
          );
        }
      } catch {
        addToast('Network error, please try again', TOAST_TYPE.ERROR);
      } finally {
        setAdding(false);
      }
      return null;
    },
    [DatabaseTableId, fetchRelations, addToast],
  );

  // Delete relation
  const deleteRelation = useCallback(
    async (relationId: string | number): Promise<boolean> => {
      setDeleting(true);
      try {
        const response = await apiClient.delete(
          API.deleteRelation(DatabaseTableId, relationId),
          { headers }
        );
        if (response.status === API_STATUS.SUCCESS) {
          addToast('Relation deleted successfully', TOAST_TYPE.SUCCESS);
          await fetchRelations();
          return true;
        } else {
          addToast(
            (response as { message?: string }).message || 'Failed to delete relation',
            TOAST_TYPE.ERROR,
          );
        }
      } catch {
        addToast('Network error, please try again', TOAST_TYPE.ERROR);
      } finally {
        setDeleting(false);
      }
      return false;
    },
    [DatabaseTableId, fetchRelations, addToast],
  );

  // Update relation
  const updateRelation = useCallback(
    async (
      relationId: string | number,
      payload: { alias?: string; type?: string },
    ): Promise<boolean> => {
      try {
        const response = await apiClient.put(
          API.updateRelation(DatabaseTableId, relationId),
          payload,
          { headers }
        );
        if (response.status === API_STATUS.SUCCESS) {
          addToast('Relation updated successfully', TOAST_TYPE.SUCCESS);
          await fetchRelations();
          return true;
        } else {
          addToast(
            (response as { message?: string }).message || 'Failed to update relation',
            TOAST_TYPE.ERROR,
          );
        }
      } catch {
        addToast('Network error, please try again', TOAST_TYPE.ERROR);
      }
      return false;
    },
    [DatabaseTableId, fetchRelations, addToast],
  );

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
    fetchColumns,
    addRelation,
    deleteRelation,
    updateRelation,
  };
}
