/**
 * roles/composables/useRoles.ts
 * 
 * Composable for roles management
 * PURE DI: Uses @cp/config labels and API from local api/
 */

import { useState, useEffect, useCallback } from 'react';
import { MODULE_LABELS } from '@cp/config';
import { useToast } from '@/modules/_core';
import { API } from '../api';
import type { Role, ApiResponse } from '../types';
import { SYSTEM_ROLES } from '../types';
import { fetchWithCsrf } from '@/lib/csrf';

const MSG = MODULE_LABELS.roles.messages;

export function useRoles() {
    const { addToast } = useToast();
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);

    const fetchRoles = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(API.list);
            const data: ApiResponse<Role[]> = await res.json();
            if (data.status === 'success') {
                setRoles(data.data || []);
            }
        } catch {
            addToast(MSG.fetchFailed, 'error');
        }
        setLoading(false);
    }, [addToast]);

    useEffect(() => {
        fetchRoles();
    }, [fetchRoles]);

    const deleteRole = useCallback(async (role: Role) => {
        if ((SYSTEM_ROLES as readonly string[]).includes(role.name)) {
            addToast(MSG.createFailed, 'error');
            return;
        }
        if (!confirm(`${MSG.confirmDelete}`)) return;

        try {
            const res = await fetchWithCsrf(`${API.list}/${role.id}`, { method: 'DELETE' });
            const data: ApiResponse<null> = await res.json();
            if (data.status === 'success') {
                addToast(MSG.deleted, 'success');
                fetchRoles();
            } else {
                addToast(data.message || MSG.createFailed, 'error');
            }
        } catch {
            addToast(MSG.connectionError, 'error');
        }
    }, [fetchRoles, addToast]);

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
