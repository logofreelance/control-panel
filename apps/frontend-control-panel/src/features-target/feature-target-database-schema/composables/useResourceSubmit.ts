import { useState, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { apiClient } from '@/lib/frontend-api';
import { useToast } from '@/modules/_core';
import { API } from '../api/endpoints';
import { FEATURE_MESSAGES } from '../constants';
import { TOAST_TYPE, API_STATUS } from '@/lib/config/defaults';
import type { Resource, DatabaseTable } from '../types';

export interface ResourcePayload {
  data_source_id: string | number;
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
/**
 * Hook for submitting resource create/update
 * Modularized: Uses internal API and local constants
 */
export function useResourceSubmit(DatabaseTableId: string | number) {
  const { addToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const params = useParams();
  
  const rawNodeId = Array.isArray(params.id) ? params.id[0] : params.id;
  const targetId = rawNodeId;

  const headers = useMemo((): Record<string, string> => {
    const h: Record<string, string> = {};
    if (targetId) h['x-target-id'] = String(Array.isArray(targetId) ? targetId[0] : targetId);
    return h;
  }, [targetId]);

  // Validate payload before submit
  const validate = useCallback(
    (name: string, slug: string): string[] => {
      const errors: string[] = [];
      if (!name.trim()) errors.push(FEATURE_MESSAGES.validation.resourceNameRequired);
      if (!slug.trim()) errors.push(FEATURE_MESSAGES.validation.slugRequired);
      return errors;
    },
    [],
  );

  // Create resource
  const create = useCallback(
    async (payload: ResourcePayload): Promise<Resource | null> => {
      const errors = validate(payload.name, payload.slug);
      if (errors.length > 0) {
        errors.forEach((err) => addToast(err, TOAST_TYPE.ERROR));
        return null;
      }

      setSubmitting(true);
      try {
        const response = await apiClient.post<Resource>(
          API.resources(DatabaseTableId),
          { ...payload, is_active: true },
          { headers }
        );
        if (response.status === API_STATUS.SUCCESS && response.data) {
          addToast(FEATURE_MESSAGES.success.resourceCreated, TOAST_TYPE.SUCCESS);
          return response.data;
        } else {
          addToast(
            (response as { message?: string }).message || 'Failed to create resource',
            TOAST_TYPE.ERROR,
          );
        }
      } catch {
        addToast('Network error occurred', TOAST_TYPE.ERROR);
      } finally {
        setSubmitting(false);
      }
      return null;
    },
    [DatabaseTableId, validate, addToast, headers],
  );

  // Update resource
  const update = useCallback(
    async (resourceId: number, payload: ResourcePayload): Promise<Resource | null> => {
      const errors = validate(payload.name, payload.slug);
      if (errors.length > 0) {
        errors.forEach((err) => addToast(err, TOAST_TYPE.ERROR));
        return null;
      }

      setSubmitting(true);
      try {
        const response = await apiClient.put<Resource>(
          API.updateResource(DatabaseTableId, resourceId),
          payload,
          { headers }
        );
        if (response.status === API_STATUS.SUCCESS && response.data) {
          addToast(FEATURE_MESSAGES.success.resourceUpdated, TOAST_TYPE.SUCCESS);
          return response.data;
        } else {
          addToast(
            (response as { message?: string }).message || 'Failed to update resource',
            TOAST_TYPE.ERROR,
          );
        }
      } catch {
        addToast('Network error occurred', TOAST_TYPE.ERROR);
      } finally {
        setSubmitting(false);
      }
      return null;
    },
    [DatabaseTableId, validate, addToast, headers],
  );

  // Fetch available data sources for joins (excluding current)
  const fetchAvailableSources = useCallback(
    async (excludeId?: string | number): Promise<DatabaseTable[]> => {
      try {
        const response = await apiClient.get<DatabaseTable[]>(API.list, { headers });
        if (response.status === API_STATUS.SUCCESS && response.data) {
          const sources = response.data;

          // Add System Users Mock (if not present)
          if (!sources.some((s) => s.id === 0)) {
            sources.push({
              id: 0,
              name: 'System Users',
              tableName: 'users',
              isSystem: true,
              schema_json: JSON.stringify({
                columns: [
                  { name: 'id', type: 'integer' },
                  { name: 'email', type: 'string' },
                  { name: 'username', type: 'string' },
                  { name: 'role', type: 'string' },
                  { name: 'created_at', type: 'timestamp' },
                  { name: 'updated_at', type: 'timestamp' },
                ],
              }),
            } as any);
          }

          return excludeId ? sources.filter((ds) => ds.id !== excludeId) : sources;
        }
      } catch (err) {
        console.error('Failed to fetch sources:', err);
      }
      return [];
    },
    [headers],
  );

  return {
    submitting,
    validate,
    create,
    update,
    fetchAvailableSources,
  };
}
