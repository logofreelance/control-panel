/**
 * feature-target-roles-permissions/composables/usePermissions.ts
 * 
 * Composable for permissions management
 */

import { useState, useEffect, useCallback } from 'react';
import { MODULE_LABELS } from '@/lib/config';
import { useToast } from '@/modules/_core';
import { API } from '../api';
import { useParams } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import type { Permission, PermissionForm, GroupedPermissions, ApiResponse } from '../types';

const L = MODULE_LABELS.rolesPermissions.permissions;
const MSG = L.messages;

const INITIAL_FORM: PermissionForm = { name: '', group: '', description: '' };

export function usePermissions() {
    const params = useParams();
    const nodeId = params?.id as string;
    const { addToast } = useToast();
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState<PermissionForm>(INITIAL_FORM);
    const [editingPermission, setEditingPermission] = useState<Permission | null>(null);

    const fetchPermissions = useCallback(async () => {
        if (!nodeId) return;
        setLoading(true);
        try {
            const data = await apiClient.get<ApiResponse<Permission[]>>('/permissions', {
                headers: { 'x-target-id': nodeId }
            });
            if (data.status === 'success') {
                setPermissions(data.data || []);
            }
        } catch {
            addToast(MSG.fetchFailed, 'error');
        }
        setLoading(false);
    }, [addToast, nodeId]);

    useEffect(() => {
        fetchPermissions();
    }, [fetchPermissions]);

    const handleCreate = useCallback(() => {
        setEditingPermission(null);
        setForm(INITIAL_FORM);
        setShowModal(true);
    }, []);

    const handleEdit = useCallback((p: Permission) => {
        setEditingPermission(p);
        setForm({
            name: p.name,
            group: p.group || '',
            description: p.description || ''
        });
        setShowModal(true);
    }, []);

    const createPermission = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nodeId) return;
        try {
            const data = await apiClient.post<ApiResponse<null>>('/permissions', form, {
                headers: { 'x-target-id': nodeId }
            });
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
    }, [form, fetchPermissions, addToast, nodeId]);

    const updatePermission = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingPermission || !nodeId) return;

        try {
            const data = await apiClient.put<ApiResponse<null>>(`/permissions/${editingPermission.id}`, form, {
                headers: { 'x-target-id': nodeId }
            });
            if (data.status === 'success') {
                addToast(MSG.updated || 'Permission updated', 'success');
                setShowModal(false);
                setEditingPermission(null);
                setForm(INITIAL_FORM);
                fetchPermissions();
            } else {
                addToast(data.message || 'Update failed', 'error');
            }
        } catch {
            addToast(MSG.connectionError, 'error');
        }
    }, [form, editingPermission, fetchPermissions, addToast, nodeId]);

    const deletePermission = useCallback(async (id: number) => {
        if (!nodeId) return;
        if (!confirm(MSG.confirmDelete)) return;
        try {
            const data = await apiClient.delete<ApiResponse<null>>(`/permissions/${id}`, {
                headers: { 'x-target-id': nodeId }
            });
            if (data.status === 'success') {
                addToast(MSG.deleted, 'success');
                fetchPermissions();
            }
        } catch {
            addToast(MSG.createFailed, 'error');
        }
    }, [fetchPermissions, addToast, nodeId]);


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
        editingPermission,
        handleCreate,
        handleEdit,
        createPermission,
        updatePermission,
        deletePermission,
        refresh: fetchPermissions,
    };
}
