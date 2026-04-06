/**
 * feature-target-roles-permissions/composables/useRoleModal.ts
 * 
 * Composable for role modal form logic
 */

import { useState, useEffect, useCallback } from 'react';
import { MODULE_LABELS } from '@/lib/config';
import { useToast } from '@/modules/_core';
import { API } from '../api';
import { useParams } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import type { Role, RoleForm, Permission, GroupedPermissions, ApiResponse } from '../types';

const L = MODULE_LABELS.rolesPermissions.roles;
const MSG = L.messages;

const INITIAL_FORM: RoleForm = {
    name: '',
    displayName: '',
    description: '',
    level: 10,
    isSuper: false,
    selectedPermissions: []
};

export function useRoleModal(
    isOpen: boolean,
    role: Role | null,
    onSuccess: () => void
) {
    const params = useParams();
    const nodeId = params?.id as string;
    const { addToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [form, setForm] = useState<RoleForm>(INITIAL_FORM);

    // Fetch available permissions
    useEffect(() => {
        if (isOpen && nodeId) {
            apiClient.get<ApiResponse<Permission[]>>('/permissions', {
                headers: { 'x-target-id': nodeId }
            })
            .then((data) => {
                if (data.status === 'success') {
                    setPermissions(data.data || []);
                }
            })
            .catch(() => { });
        }
    }, [isOpen, nodeId]);

    // Reset form when role changes
    useEffect(() => {
        if (role) {
            let parsedPermissions = [];
            try {
                parsedPermissions = typeof role.permissions === 'string' 
                    ? JSON.parse(role.permissions) 
                    : (Array.isArray(role.permissions) ? role.permissions : []);
            } catch (e) {
                console.error('Failed to parse permissions', e);
            }
            
            setForm({
                name: role.name,
                displayName: role.display_name || '',
                description: role.description || '',
                level: role.level || 10,
                isSuper: role.is_super || false,
                selectedPermissions: parsedPermissions
            });
        } else {
            setForm(INITIAL_FORM);
        }
    }, [role, isOpen]);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nodeId) return;
        setLoading(true);

        const payload = {
            name: form.name,
            displayName: form.displayName || form.name,
            description: form.description,
            level: form.level,
            isSuper: form.isSuper,
            permissions: form.selectedPermissions
        };

        try {
            const endpoint = role ? `/roles/${role.id}` : '/roles';
            const method = role ? 'put' : 'post';

            const data = await (apiClient as any)[method](endpoint, payload, {
                headers: { 'x-target-id': nodeId }
            });

            if (data.status === 'success') {
                addToast(role ? MSG.updated : MSG.created, 'success');
                onSuccess();
            } else {
                addToast(data.message || MSG.createFailed, 'error');
            }
        } catch {
            addToast(MSG.connectionError, 'error');
        }

        setLoading(false);
    }, [form, role, onSuccess, addToast, nodeId]);


    const togglePermission = useCallback((permName: string) => {
        setForm(prev => ({
            ...prev,
            selectedPermissions: prev.selectedPermissions.includes(permName)
                ? prev.selectedPermissions.filter(p => p !== permName)
                : [...prev.selectedPermissions, permName]
        }));
    }, []);

    // Group permissions by group field
    const groupedPermissions: GroupedPermissions = permissions.reduce((acc, perm) => {
        const g = perm.group || L.labels.other;
        if (!acc[g]) acc[g] = [];
        acc[g].push(perm);
        return acc;
    }, {} as GroupedPermissions);

    const updateForm = useCallback((updates: Partial<RoleForm>) => {
        setForm(prev => ({ ...prev, ...updates }));
    }, []);

    return {
        loading,
        permissions,
        form,
        setForm: updateForm,
        groupedPermissions,
        handleSubmit,
        togglePermission,
    };
}
