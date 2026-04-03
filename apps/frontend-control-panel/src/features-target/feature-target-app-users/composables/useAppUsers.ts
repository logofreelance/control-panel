'use client';

/**
 * useAppUsers - Composable for managing App Users in a target system.
 * Injects x-target-id header automatically for all requests.
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useToast, usePageLoading } from '@/modules/_core';
import { 
    APP_USER_ENDPOINTS, 
    APP_USER_DEFAULT_FILTER, 
    APP_USER_DEFAULT_PAGINATION 
} from '../constants/app-user.constants';
import type { 
    AppUser, 
    AppUserFormData, 
    AppUsersFilterState, 
    AppUserPaginationState, 
    AppUserApiResponse, 
    AppUserRoleInfo 
} from '../types/app-user.types';

export function useAppUsers() {
    const params = useParams();
    const targetId = params?.id as string;
    
    const { addToast } = useToast();
    const { setPageLoading } = usePageLoading();
    
    const [users, setUsers] = useState<AppUser[]>([]);
    const [roles, setRoles] = useState<AppUserRoleInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [rolesLoading, setRolesLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // State for Filter & Pagination
    const [filter, setFilter] = useState<AppUsersFilterState>(APP_USER_DEFAULT_FILTER);
    const [pagination, setPagination] = useState<AppUserPaginationState>(APP_USER_DEFAULT_PAGINATION);

    // Common headers with target ID
    const getHeaders = useCallback(() => {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json'
        };
        if (targetId) {
            headers['x-target-id'] = targetId;
        }
        return headers;
    }, [targetId]);

    // Sync loading state with global page loading
    useEffect(() => {
        const isInitialLoading = loading && rolesLoading;
        setPageLoading(isInitialLoading);
    }, [loading, rolesLoading, setPageLoading]);

    // Build Query String
    const getQueryString = useCallback(() => {
        const p = new URLSearchParams();
        if (pagination.page) p.append('page', pagination.page.toString());
        if (pagination.limit) p.append('limit', pagination.limit.toString());
        if (filter.search) p.append('search', filter.search);
        if (filter.role && filter.role !== 'all') p.append('role', filter.role);
        if (filter.status && filter.status !== 'all') p.append('status', filter.status);

        const sort = filter.dateOrder === 'oldest' ? 'asc' : 'desc';
        p.append('sort', sort);

        return p.toString();
    }, [pagination.page, pagination.limit, filter]);

    // Fetch users (Server-Side)
    const fetchUsers = useCallback(async () => {
        if (!targetId) return;
        
        setLoading(true);
        try {
            const query = getQueryString();
            const res = await fetch(`${APP_USER_ENDPOINTS.list}?${query}`, {
                headers: getHeaders()
            });
            const data: AppUserApiResponse<AppUser[]> = await res.json();

            if (data.status === 'success' && data.data) {
                setUsers(data.data);
                if (data.meta) {
                    setPagination(prev => ({
                        ...prev,
                        total: data.meta?.total || 0,
                        page: data.meta?.page || prev.page,
                        limit: data.meta?.limit || prev.limit
                    }));
                }
            } else if (res.status === 401) {
                setUsers([]);
            } else {
                addToast(data.message || 'Failed to fetch users', 'error');
            }
        } catch {
            addToast('Connection error while fetching users', 'error');
        }
        setLoading(false);
    }, [addToast, getQueryString, getHeaders, targetId]);

    // Fetch roles
    const fetchRoles = useCallback(async () => {
        if (!targetId) return;
        
        setRolesLoading(true);
        try {
            const res = await fetch(APP_USER_ENDPOINTS.roles, {
                headers: getHeaders()
            });
            const data = await res.json();
            if (data.status === 'success' && data.data) {
                setRoles(data.data.map((r: any) => ({
                    name: r.name,
                    display_name: r.display_name || r.name,
                    level: r.level || 0,
                    is_super: r.is_super || r.isSuper || false
                })));
            }
        } catch (e) {
            console.error('Error fetching app roles:', e);
        }
        setRolesLoading(false);
    }, [getHeaders, targetId]);

    // Action Handlers
    const createUser = useCallback(async (formData: AppUserFormData) => {
        setSubmitting(true);
        try {
            const res = await fetch(APP_USER_ENDPOINTS.create, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.status === 'success') {
                addToast('App user created successfully', 'success');
                await fetchUsers();
                setSubmitting(false);
                return true;
            } else {
                addToast(data.message || 'Failed to create user', 'error');
            }
        } catch {
            addToast('Connection error', 'error');
        }
        setSubmitting(false);
        return false;
    }, [addToast, fetchUsers, getHeaders]);

    const updateUser = useCallback(async (id: number, formData: Partial<AppUserFormData>) => {
        setSubmitting(true);
        try {
            const res = await fetch(APP_USER_ENDPOINTS.update(id), {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.status === 'success') {
                addToast('App user updated successfully', 'success');
                await fetchUsers();
                setSubmitting(false);
                return true;
            } else {
                addToast(data.message || 'Failed to update user', 'error');
            }
        } catch {
            addToast('Connection error', 'error');
        }
        setSubmitting(false);
        return false;
    }, [addToast, fetchUsers, getHeaders]);

    const deleteUser = useCallback(async (id: number) => {
        setSubmitting(true);
        try {
            const res = await fetch(APP_USER_ENDPOINTS.delete(id), { 
                method: 'DELETE',
                headers: getHeaders()
            });
            const data = await res.json();
            if (data.status === 'success') {
                addToast('App user deleted', 'success');
                await fetchUsers();
                setSubmitting(false);
                return true;
            } else {
                addToast(data.message || 'Failed to delete user', 'error');
            }
        } catch {
            addToast('Connection error', 'error');
        }
        setSubmitting(false);
        return false;
    }, [addToast, fetchUsers, getHeaders]);

    const updateFilter = useCallback((key: keyof AppUsersFilterState, value: string) => {
        setFilter((prev) => ({ ...prev, [key]: value }));
        setPagination(prev => ({ ...prev, page: 1 }));
    }, []);

    const resetFilter = useCallback(() => {
        setFilter(APP_USER_DEFAULT_FILTER);
        setPagination(prev => ({ ...prev, page: 1 }));
    }, []);

    const goToPage = useCallback((page: number) => {
        setPagination(prev => ({ ...prev, page }));
    }, []);

    const setLimit = useCallback((limit: number) => {
        setPagination(prev => ({ ...prev, limit, page: 1 }));
    }, []);

    // Initial fetch
    useEffect(() => {
        if (targetId) {
            fetchRoles();
            fetchUsers();
        }
    }, [fetchRoles, fetchUsers, targetId]);

    return {
        users,
        roles,
        loading,
        rolesLoading,
        submitting,
        filter,
        updateFilter,
        resetFilter,
        pagination,
        totalPages: Math.ceil(pagination.total / pagination.limit),
        totalUsers: pagination.total,
        goToPage,
        setLimit,
        fetchUsers,
        fetchRoles,
        createUser,
        updateUser,
        deleteUser,
    };
}
