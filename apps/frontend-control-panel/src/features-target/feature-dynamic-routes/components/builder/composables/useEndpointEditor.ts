'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast, useConfig } from '@/modules/_core';
import { env } from '@/lib/env';
import { DYNAMIC_ROUTES_API } from '../../../api';
import { ApiCategory, ApiEndpoint } from '@/features-target/feature-dynamic-routes';
import { DYNAMIC_ROUTES_LABELS } from '../../../constants/ui-labels';

const L = DYNAMIC_ROUTES_LABELS.routeBuilder;

export function useEndpointEditor(targetId: string, endpointId?: string, onBack?: () => void) {
    const router = useRouter();
    const { addToast } = useToast();
    const { api } = useConfig();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Data Dependencies
    const [categories, setCategories] = useState<ApiCategory[]>([]);
    const [dataSources, setDataSources] = useState<{ id: string; name: string }[]>([]);
    const [resources, setResources] = useState<{ id: string; name: string; description?: string }[]>([]);
    const [availableRoles, setAvailableRoles] = useState<{ name: string; level: number; isSuper: boolean }[]>([]);
    const [availablePermissions, setAvailablePermissions] = useState<string[]>([]);
    const [errorTemplates, setErrorTemplates] = useState<{ status_code: number; template: string }[]>([]);

    // Form
    const [form, setForm] = useState<Partial<ApiEndpoint>>({
        method: 'GET',
        isActive: true,
        minRoleLevel: 0, // Default: public access
        responseData: '{"status": "success", "data": {{DATA}}, "count": {{COUNT}}}'
    });

    // Validation States
    const [pathError, setPathError] = useState<string | null>(null);
    const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
    // Removed allEndpoints state as we now check server-side

    // Tab State
    const [activeTab, setActiveTab] = useState<'basic' | 'data' | 'mutation' | 'security' | 'response' | 'test'>('basic');

    // Fetch Resources when DataSource changes
    const fetchResources = useCallback(async (dsId: string) => {
        try {
            const res = await fetch(api.databaseSchema.resources(dsId), { headers: { 'x-target-id': targetId } });
            const data = await res.json();
            if (data.status === 'success') {
                setResources(data.data);
            } else {
                setResources([]);
            }
        } catch {
            setResources([]);
        }
    }, [api.databaseSchema]);

    // Column type for Mutation tab
    interface ColumnInfo {
        name: string;
        type: string;
        nullable: boolean;
        isPrimary: boolean;
        hasDefault: boolean;
        relationTarget?: string; // Target table for foreign key columns
    }

    // Columns state for Mutation configuration
    const [columns, setColumns] = useState<ColumnInfo[]>([]);

    // Fetch Columns when DataSource changes
    const fetchColumns = useCallback(async (dsId: string) => {
        try {
            const res = await fetch(api.databaseSchema.columns(dsId), { headers: { 'x-target-id': targetId } });
            const data = await res.json();
            if (data.status === 'success') {
                setColumns(data.data);
            } else {
                setColumns([]);
            }
        } catch {
            setColumns([]);
        }
    }, [api.databaseSchema]);

    // Initial Load
    useEffect(() => {
        const init = async () => {
            try {
                // Fetch All Dependencies in Parallel
                const [catRes, dsRes, roleRes, permRes, errTplRes] = await Promise.all([
                    fetch(DYNAMIC_ROUTES_API.categories.list, { headers: { 'x-target-id': targetId } }),
                    fetch(api.databaseSchema.list, { headers: { 'x-target-id': targetId } }),
                    fetch(`${env.API_URL}/roles`, { headers: { 'x-target-id': targetId } }),
                    fetch(`${env.API_URL}/permissions`, { headers: { 'x-target-id': targetId } }),
                    fetch(DYNAMIC_ROUTES_API.errorTemplates.list, { headers: { 'x-target-id': targetId } })
                ]);

                const catData = await catRes.json();
                const dsData = await dsRes.json();
                const roleData = await roleRes.json();
                const permData = await permRes.json();
                const errTplData = await errTplRes.json();

                if (catData.status === 'success') setCategories(catData.data);
                if (dsData.status === 'success') setDataSources(dsData.data);
                if (roleData.status === 'success') {
                    // Map role objects with level and isSuper info
                    setAvailableRoles(roleData.data.map((r: { name: string; level?: number; is_super?: boolean; isSuper?: boolean }) => ({
                        name: r.name,
                        level: r.level || 0,
                        isSuper: r.is_super || r.isSuper || false
                    })));
                }
                if (permData.status === 'success') setAvailablePermissions(permData.data.map((p: { name: string }) => p.name));
                if (errTplData.status === 'success') setErrorTemplates(errTplData.data);

                // Fetch endpoint details if Edit Mode (only ONE endpoint)
                if (endpointId) {
                    const detailRes = await fetch(DYNAMIC_ROUTES_API.endpoints.detail(endpointId), { headers: { 'x-target-id': targetId } });
                    const detailData = await detailRes.json();

                    if (detailData.status === 'success') {
                        const found = detailData.data;
                        if (found) {
                            setForm(found);
                            // Trigger resource fetch if DS is already selected
                            if (found.dataSourceId) {
                                fetchResources(found.dataSourceId);
                                fetchColumns(found.dataSourceId);
                            }
                        }
                    }
                }
            } catch {
                addToast(L.messages.fetchError || 'Failed to load data', 'error');
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [endpointId, api.databaseSchema, addToast, fetchResources, fetchColumns]);

    const handleDataSourceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        const dsId = val || undefined;
        setForm(prev => ({ ...prev, dataSourceId: dsId, resourceId: undefined })); // Reset resource when DS changes
        if (dsId) {
            fetchResources(dsId);
            fetchColumns(dsId); // Fetch columns for Mutation tab
        } else {
            setResources([]);
            setColumns([]);
        }
    };

    // Path validation helper
    const validatePath = useCallback((path: string): string | null => {
        if (!path) return 'Path is required';
        if (!path.startsWith('/')) return 'Path must start with /';
        if (!/^[\w\-\/:]+$/.test(path)) return 'Path contains invalid characters (only letters, numbers, _, -, /, : allowed)';
        if (/\s/.test(path)) return 'Path cannot contain spaces';
        return null;
    }, []);

    // Duplicate path check helper (client-side since backend no longer has a dedicated check endpoint)
    const checkDuplicate = useCallback(async (path: string, method: string): Promise<string | null> => {
        if (!path || !method) return null;
        try {
            // Fetch all endpoints and check client-side
            const res = await fetch(DYNAMIC_ROUTES_API.endpoints.list, { headers: { 'x-target-id': targetId } });
            const data = await res.json();
            if (data.status === 'success' && Array.isArray(data.data)) {
                const duplicate = data.data.find((ep: any) => 
                    (ep.endpoint === path || ep.path === path) && 
                    ep.method === method && 
                    ep.id !== endpointId
                );
                if (duplicate) {
                    return `Endpoint ${method} ${path} already exists`;
                }
            }
        } catch (e) {
            console.error('Failed to check duplicate', e);
        }
        return null;
    }, [endpointId]);

    const handleSave = async () => {
        if (!form.path || !form.method) {
            addToast('Path and Method are required', 'error');
            return;
        }

        // Validate path format
        const pathValidationError = validatePath(form.path);
        if (pathValidationError) {
            addToast(pathValidationError, 'error');
            setPathError(pathValidationError);
            return;
        }

        // Check for duplicates (Async)
        const duplicateError = await checkDuplicate(form.path, form.method);
        if (duplicateError) {
            addToast(duplicateError, 'error');
            setDuplicateWarning(duplicateError);
            return;
        }

        setSaving(true);
        try {
            const res = await fetch(DYNAMIC_ROUTES_API.endpoints.save, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-target-id': targetId },
                body: JSON.stringify(form)
            });

            const data = await res.json();
            if (data.status === 'success') {
                addToast(L.messages.endpointSaved || 'Endpoint saved successfully', 'success');
                onBack?.();
            } else {
                addToast(data.message, 'error');
            }
        } catch {
            addToast(L.messages.saveError || 'Failed to save', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!endpointId || !confirm(L.messages.confirmDeleteEndpoint || 'Are you sure you want to delete this endpoint?')) return;

        try {
            const res = await fetch(DYNAMIC_ROUTES_API.endpoints.delete(endpointId), { method: 'DELETE', headers: { 'x-target-id': targetId } });
            if (res.ok) {
                addToast(L.messages.endpointDeleted || 'Endpoint deleted', 'success');
                onBack?.();
            }
        } catch {
            addToast(L.messages.deleteError || 'Failed to delete', 'error');
        }
    };

    return {
        // State
        loading,
        saving,
        form,
        setForm,
        categories,
        dataSources,
        resources,
        columns, // For Mutation tab column selector
        availableRoles,
        availablePermissions,
        errorTemplates,
        activeTab,
        setActiveTab,

        // Validation States
        pathError,
        setPathError,
        duplicateWarning,
        setDuplicateWarning,

        // Validation Helpers
        validatePath,
        checkDuplicate,

        // Actions
        handleDataSourceChange,
        handleSave,
        handleDelete,
        router
    };
}
