/**
 * permissions/composables/usePermissions.ts
 * 
 * Composable for permissions management
 * PURE DI: Uses @cp/config labels and API from local api/
 */

import { useState, useEffect, useCallback } from 'react';
import { MODULE_LABELS } from '@cp/config';
import { useToast } from '@/modules/_core';
import { API } from '../api';
import type { Permission, PermissionForm, GroupedPermissions, ApiResponse } from '../types';
import { fetchWithCsrf } from '@/lib/csrf';

const MSG = MODULE_LABELS.permissions.messages;
const L = MODULE_LABELS.permissions;

const INITIAL_FORM: PermissionForm = { name: '', group: '', description: '' };

export function usePermissions() {
    const { addToast } = useToast();
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState<PermissionForm>(INITIAL_FORM);

    const fetchPermissions = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(API.list);
            const data: ApiResponse<Permission[]> = await res.json();
            if (data.status === 'success') {
                setPermissions(data.data || []);
            }
        } catch {
            addToast(MSG.fetchFailed, 'error');
        }
        setLoading(false);
    }, [addToast]);

    useEffect(() => {
        fetchPermissions();
    }, [fetchPermissions]);

    const createPermission = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetchWithCsrf(API.list, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            const data: ApiResponse<null> = await res.json();
            if (data.status === 'success') {
                addToast(MSG.created, 'success');
                setShowModal(false);
                setForm(INITIAL_FORM);
                fetchPermissions();
            } else {
                addToast(data.message || MSG.createFailed, 'error');
            }
        } catch {
            addToast(MSG.connectionError, 'error');
        }
    }, [form, fetchPermissions, addToast]);

    const deletePermission = useCallback(async (id: number) => {
        if (!confirm(MSG.confirmDelete)) return;
        try {
            const res = await fetchWithCsrf(`${API.list}/${id}`, { method: 'DELETE' });
            const data: ApiResponse<null> = await res.json();
            if (data.status === 'success') {
                addToast(MSG.deleted, 'success');
                fetchPermissions();
            }
        } catch {
            addToast(MSG.createFailed, 'error');
        }
    }, [fetchPermissions, addToast]);

    // Group permissions by group field
    const grouped: GroupedPermissions = permissions.reduce((acc, perm) => {
        const g = perm.group || L.labels.other;
        if (!acc[g]) acc[g] = [];
        acc[g].push(perm);
        return acc;
    }, {} as GroupedPermissions);

    return {
        permissions,
        loading,
        grouped,
        showModal,
        setShowModal,
        form,
        setForm,
        createPermission,
        deletePermission,
        refresh: fetchPermissions,
    };
}
