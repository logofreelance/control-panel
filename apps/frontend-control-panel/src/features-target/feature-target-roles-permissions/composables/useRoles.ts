/**
 * feature-target-roles-permissions/composables/useRoles.ts
 * 
 * Composable for roles management
 */

import { useState, useEffect, useCallback } from 'react';
import { MODULE_LABELS } from '@/lib/config';
import { useToast } from '@/modules/_core';
import { API } from '../api';
import { useParams } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import type { Role, ApiResponse } from '../types';
import { SYSTEM_ROLES } from '../types';

const L = MODULE_LABELS.rolesPermissions.roles;
const MSG = L.messages;

export function useRoles() {
    const params = useParams();
    const nodeId = params?.id as string;
    const { addToast } = useToast();
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);

    const fetchRoles = useCallback(async () => {
        if (!nodeId) return;
        setLoading(true);
        try {
            const data = await apiClient.get<ApiResponse<Role[]>>('/roles', {
                headers: { 'x-target-id': nodeId }
            });
            if (data.status === 'success') {
                setRoles(data.data || []);
            }
        } catch {
            addToast(MSG.fetchFailed, 'error');
        }
        setLoading(false);
    }, [addToast, nodeId]);

    useEffect(() => {
        fetchRoles();
    }, [fetchRoles]);

    const deleteRole = useCallback(async (role: Role) => {
        if (!nodeId) return;
        if ((SYSTEM_ROLES as readonly string[]).includes(role.name)) {
            addToast(MSG.createFailed, 'error'); // Better error message for system roles if available
            return;
        }
        if (!confirm(`${MSG.confirmDelete}`)) return;

        try {
            const data = await apiClient.delete<ApiResponse<null>>(`/roles/${role.id}`, {
                headers: { 'x-target-id': nodeId }
            });
            if (data.status === 'success') {
                addToast(MSG.deleted, 'success');
                fetchRoles();
            } else {
                addToast(data.message || MSG.createFailed, 'error');
            }
        } catch {
            addToast(MSG.connectionError, 'error');
        }
    }, [fetchRoles, addToast, nodeId]);


    const handleEdit = useCallback((role: Role) => {
        setEditingRole(role);
        setModalOpen(true);
    }, []);

    const handleCreate = useCallback(() => {
        setEditingRole(null);
        setModalOpen(true);
    }, []);

    const handleModalClose = useCallback(() => {
        setModalOpen(false);
        setEditingRole(null);
    }, []);

    const handleModalSuccess = useCallback(() => {
        handleModalClose();
        fetchRoles();
    }, [handleModalClose, fetchRoles]);

    // Check if role is a system role
    const isSystemRole = useCallback((roleName: string) => {
        return (SYSTEM_ROLES as readonly string[]).includes(roleName);
    }, []);

    // Get level-based color class
    const getLevelColor = useCallback((level: number) => {
        if (level >= 90) return 'bg-red-100 text-red-600 border-red-200';
        if (level >= 70) return 'bg-amber-100 text-amber-600 border-amber-200';
        if (level >= 50) return 'bg-blue-100 text-blue-600 border-blue-200';
        if (level >= 30) return 'bg-purple-100 text-purple-600 border-purple-200';
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }, []);

    // Get level bar class
    const getLevelBarColor = useCallback((level: number) => {
        if (level >= 90) return 'bg-red-400';
        if (level >= 70) return 'bg-amber-400';
        if (level >= 50) return 'bg-blue-400';
        if (level >= 30) return 'bg-purple-400';
        return 'bg-slate-400';
    }, []);

    return {
        roles,
        loading,
        modalOpen,
        editingRole,
        setModalOpen,
        fetchRoles,
        deleteRole,
        handleEdit,
        handleCreate,
        handleModalClose,
        handleModalSuccess,
        isSystemRole,
        getLevelColor,
        getLevelBarColor,
    };
}
