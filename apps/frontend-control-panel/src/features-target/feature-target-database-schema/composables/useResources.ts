/**
 * database-schema/composables/useResources.ts
 *
 * CRUD hook for resources (nested under data source)
 *
 * ✅ PURE DI: Uses useConfig() hook for all config, messages, and API
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { apiClient } from '@/lib/frontend-api';
import { useToast } from '@/modules/_core';
import { API } from '../api/endpoints';
import { FEATURE_MESSAGES } from '../constants';
import { TOAST_TYPE, API_STATUS } from '@/lib/config/defaults';
import type { Resource } from '../types';

export interface UseResourcesOptions {
  /** Skip initial fetch */
  skipInitialFetch?: boolean;
}

export interface UseResourcesReturn {
  items: Resource[];
  loading: boolean;
  error: Error | null;
  fetchAll: () => Promise<void>;
  fetchOne: (resourceId: string | number) => Promise<Resource | null>;
  create: (data: Partial<Resource>) => Promise<Resource | null>;
  update: (resourceId: string | number, data: Partial<Resource>) => Promise<Resource | null>;
  remove: (resourceId: string | number) => Promise<boolean>;
}

/**
 * Hook for managing resources under a specific data source
 * Modularized: Uses internal API and local FEATURE_MESSAGES
 */
export function useResources(
  DatabaseTableId: string | number | null,
  options: UseResourcesOptions = {},
): UseResourcesReturn {
  const { skipInitialFetch = false } = options;
  const { addToast } = useToast();
  const params = useParams();
  const rawNodeId = Array.isArray(params.id) ? params.id[0] : params.id;
  const targetId = rawNodeId;

  const [items, setItems] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getHeaders = useCallback(() => {
    const h: Record<string, string> = {};
    if (targetId) h['x-target-id'] = String(Array.isArray(targetId) ? targetId[0] : targetId);
    return h;
  }, [targetId]);

  const fetchAll = useCallback(async () => {
    if (!DatabaseTableId) return;

    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<Resource[]>(
        API.pageSchemaList.resources(String(DatabaseTableId)),
        { headers: getHeaders() }
      );
      if (response.status === API_STATUS.SUCCESS && response.data) {
        setItems(response.data);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      addToast(FEATURE_MESSAGES.error.resourceLoadFailed, TOAST_TYPE.ERROR);
    } finally {
      setLoading(false);
    }
  }, [DatabaseTableId, addToast, getHeaders]);

  const fetchOne = useCallback(
    async (resourceId: string | number): Promise<Resource | null> => {
      if (!DatabaseTableId) return null;

      try {
        const response = await apiClient.get<Resource>(
          API.pageResourceEdit.resource(String(DatabaseTableId), String(resourceId)),
          { headers: getHeaders() }
        );
        if (response.status === API_STATUS.SUCCESS && response.data) {
          return response.data;
        }
      } catch {
        addToast(FEATURE_MESSAGES.error.resourceLoadFailed, TOAST_TYPE.ERROR);
      }
      return null;
    },
    [DatabaseTableId, addToast, getHeaders],
  );

  const create = useCallback(
    async (data: Partial<Resource>): Promise<Resource | null> => {
      if (!DatabaseTableId) return null;

      try {
        const response = await apiClient.post<Resource>(
          API.pageResourceCreate.submit(String(DatabaseTableId)),
          data,
          { headers: getHeaders() }
        );
        if (response.status === API_STATUS.SUCCESS && response.data) {
          setItems((prev) => [...prev, response.data!]);
          addToast(FEATURE_MESSAGES.success.resourceCreated, TOAST_TYPE.SUCCESS);
          return response.data;
        }
      } catch {
        addToast(FEATURE_MESSAGES.error.resourceCreateFailed, TOAST_TYPE.ERROR);
      }
      return null;
    },
    [DatabaseTableId, addToast, getHeaders],
  );

  const update = useCallback(
    async (resourceId: string | number, data: Partial<Resource>): Promise<Resource | null> => {
      if (!DatabaseTableId) return null;

      try {
        const response = await apiClient.put<Resource>(
          API.pageResourceEdit.submit(String(DatabaseTableId), String(resourceId)),
          data,
          { headers: getHeaders() }
        );
        if (response.status === API_STATUS.SUCCESS && response.data) {
          setItems((prev) =>
            prev.map((item) => (item.id === resourceId ? { ...item, ...response.data } : item)),
          );
          addToast(FEATURE_MESSAGES.success.resourceUpdated, TOAST_TYPE.SUCCESS);
          return response.data;
        }
      } catch {
        addToast(FEATURE_MESSAGES.error.resourceUpdateFailed, TOAST_TYPE.ERROR);
      }
      return null;
    },
    [DatabaseTableId, addToast, getHeaders],
  );

  const remove = useCallback(
    async (resourceId: string | number): Promise<boolean> => {
      if (!DatabaseTableId) return false;

      try {
        const response = await apiClient.delete(
          API.pageSchemaList.deleteResource(String(DatabaseTableId), String(resourceId)),
          { headers: getHeaders() }
        );
        if (response.status === API_STATUS.SUCCESS) {
          setItems((prev) => prev.filter((item) => item.id !== resourceId));
          addToast(FEATURE_MESSAGES.success.resourceDeleted, TOAST_TYPE.SUCCESS);
          return true;
        }
      } catch {
        addToast(FEATURE_MESSAGES.error.resourceDeleteFailed, TOAST_TYPE.ERROR);
      }
      return false;
    },
    [DatabaseTableId, addToast, getHeaders],
  );

  // Auto-fetch when DatabaseTableId changes
  useEffect(() => {
    if (DatabaseTableId && !skipInitialFetch) {
      fetchAll();
    } else {
      setItems([]);
    }
  }, [DatabaseTableId, skipInitialFetch, fetchAll]);

  return {
    items,
    loading,
    error,
    fetchAll,
    fetchOne,
    create,
    update,
    remove,
  };
}
