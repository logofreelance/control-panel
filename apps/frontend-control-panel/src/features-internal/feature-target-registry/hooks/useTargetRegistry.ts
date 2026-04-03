'use client';

/**
 * feature-target-registry — React Hook
 * 
 * 🤖 AI: Business logic for managing the list of registered target systems.
 * Includes CRUD, test connection, and health check actions.
 */

import { useState, useEffect, useCallback } from 'react';
import { targetRegistryApi } from '../api/target-registry.api';
import { TARGET_UI_LABELS } from '../constants/ui-labels';
import type { TargetSystem, CreateTargetInput, UpdateTargetInput, HealthCheckResult } from '../types/target-registry.types';

export function useTargetRegistry() {
    const [targets, setTargets] = useState<TargetSystem[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const fetchTargets = useCallback(async () => {
        setLoading(true);
        try {
            const res = await targetRegistryApi.list();
            if (res.success && res.data) {
                setTargets(res.data);
            }
        } catch {
            console.error(TARGET_UI_LABELS.errors.loadFailed);
        } finally {
            setLoading(false);
        }
    }, []);

    const addTarget = useCallback(async (input: CreateTargetInput): Promise<boolean> => {
        setSaving(true);
        try {
            const res = await targetRegistryApi.create(input);
            if (res.success) {
                await fetchTargets();
                return true;
            }
            return false;
        } catch {
            return false;
        } finally {
            setSaving(false);
        }
    }, [fetchTargets]);

    const editTarget = useCallback(async (id: string, input: UpdateTargetInput): Promise<boolean> => {
        setSaving(true);
        try {
            const res = await targetRegistryApi.update(id, input);
            if (res.success) {
                await fetchTargets();
                return true;
            }
            return false;
        } catch {
            return false;
        } finally {
            setSaving(false);
        }
    }, [fetchTargets]);

    const deleteTarget = useCallback(async (id: string): Promise<boolean> => {
        try {
            const res = await targetRegistryApi.remove(id);
            if (res.success) {
                setTargets(prev => prev.filter(t => t.id !== id));
                return true;
            }
            return false;
        } catch {
            return false;
        }
    }, []);

    const testConnection = useCallback(async (databaseUrl: string) => {
        try {
            const res = await targetRegistryApi.testConnection(databaseUrl);
            return res.data || { ok: false, latencyMs: 0, error: TARGET_UI_LABELS.errors.requestFailed };
        } catch {
            return { ok: false, latencyMs: 0, error: TARGET_UI_LABELS.errors.connectionTestFailed };
        }
    }, []);

    /** Run health check on a specific target system — updates status + route count */
    const checkHealth = useCallback(async (id: string): Promise<HealthCheckResult | null> => {
        try {
            const res = await targetRegistryApi.healthCheck(id);
            if (res.success && res.data) {
                // Refresh list to get updated status/routeCount
                await fetchTargets();
                return res.data;
            }
            return null;
        } catch {
            return null;
        }
    }, [fetchTargets]);

    useEffect(() => {
        fetchTargets();
    }, [fetchTargets]);

    return {
        targets,
        loading,
        saving,
        addTarget,
        editTarget,
        deleteTarget,
        testConnection,
        checkHealth,
        refresh: fetchTargets,
    };
}
