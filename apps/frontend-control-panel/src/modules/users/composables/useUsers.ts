'use client';

// useUsers - Composable for users CRUD operations
// Handles fetching, filtering, pagination, create, update, delete, and roles
// Server-Side Pagination Version

import { useState, useEffect, useCallback } from 'react';
import { MODULE_LABELS } from '@/lib/config';
import { useToast, usePageLoading } from '@/modules/_core';
import { USERS_ENDPOINTS, DEFAULT_FILTER, DEFAULT_PAGINATION } from '../constants';
import type { User, UserFormData, UsersFilterState, Pagination, ApiResponse, RoleInfo } from '../types';

const MSG = MODULE_LABELS.users.messages;

export function useUsers() {
    const { addToast } = useToast();
    const { setPageLoading } = usePageLoading();
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<RoleInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [rolesLoading, setRolesLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // State for Filter & Pagination
    const [filter, setFilter] = useState<UsersFilterState>(DEFAULT_FILTER);
    const [pagination, setPagination] = useState<Pagination>(DEFAULT_PAGINATION);

    // Sync loading state with global page loading (only on initial load)
    useEffect(() => {
        const isInitialLoading = loading && rolesLoading;
        setPageLoading(isInitialLoading);
    }, [loading, rolesLoading, setPageLoading]);

    // Build Query String
    const getQueryString = useCallback(() => {
        const params = new URLSearchParams();
        if (pagination.page) params.append('page', pagination.page.toString());
        if (pagination.limit) params.append('limit', pagination.limit.toString());
        if (filter.search) params.append('search', filter.search);
        if (filter.role && filter.role !== 'all') params.append('role', filter.role);
        if (filter.status && filter.status !== 'all') params.append('status', filter.status);

        // Sort mapping
        const sort = filter.dateOrder === 'oldest' ? 'asc' : 'desc';
        params.append('sort', sort);

        return params.toString();
    }, [pagination.page, pagination.limit, filter]);

    // Fetch users (Server-Side)
    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const query = getQueryString();
            const res = await fetch(`${USERS_ENDPOINTS.list}?${query}`);
            const data: ApiResponse<User[]> = await res.json();

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
                addToast(data.message || MSG.fetchFailed, 'error');
            }
        } catch {
            addToast(MSG.connectionError, 'error');
        }
        setLoading(false);
    }, [addToast, getQueryString]);

    // Fetch roles
    const fetchRoles = useCallback(async () => {
        setRolesLoading(true);
        try {
            const res = await fetch(USERS_ENDPOINTS.roles);
            const data = await res.json();
            if (data.status === 'success' && data.data) {
                setRoles(data.data.map((r: { name: string; display_name?: string; level?: number; is_super?: boolean; isSuper?: boolean }) => ({
                    name: r.name,
                    display_name: r.display_name || r.name,
                    level: r.level || 0,
                    is_super: r.is_super || r.isSuper || false
                })));
            }
        } catch (e) {
            console.error(e);
        }
        setRolesLoading(false);
    }, []);

    // Action Handlers
    const createUser = useCallback(async (formData: UserFormData) => {
        setSubmitting(true);
        try {
            const res = await fetch(USERS_ENDPOINTS.create, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.status === 'success') {
                addToast(MSG.created, 'success');
                await fetchUsers();
                setSubmitting(false);
                return true;
            } else {
                addToast(data.message || MSG.createFailed, 'error');
            }
        } catch {
            addToast(MSG.connectionError, 'error');
        }
        setSubmitting(false);
        return false;
    }, [addToast, fetchUsers]);

    const updateUser = useCallback(async (id: number, formData: Partial<UserFormData>) => {
        setSubmitting(true);
        try {
            const res = await fetch(USERS_ENDPOINTS.update(id), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.status === 'success') {
                addToast(MSG.updated, 'success');
                await fetchUsers();
                setSubmitting(false);
                return true;
            } else {
                addToast(data.message || MSG.createFailed, 'error');
            }
        } catch {
            addToast(MSG.connectionError, 'error');
        }
        setSubmitting(false);
        return false;
    }, [addToast, fetchUsers]);

    const deleteUser = useCallback(async (id: number) => {
        setSubmitting(true);
        try {
            const res = await fetch(USERS_ENDPOINTS.delete(id), { method: 'DELETE' });
            const data = await res.json();
            if (data.status === 'success') {
                addToast(MSG.deleted, 'success');
                await fetchUsers();
                setSubmitting(false);
                return true;
            } else {
                addToast(data.message || MSG.createFailed, 'error');
            }
        } catch {
            addToast(MSG.connectionError, 'error');
        }
        setSubmitting(false);
        return false;
    }, [addToast, fetchUsers]);

    // Updates
    const updateFilter = useCallback((key: keyof UsersFilterState, value: string) => {
        setFilter((prev: UsersFilterState) => ({ ...prev, [key]: value }));
        setPagination(prev => ({ ...prev, page: 1 })); // Reset to page 1 on filter change
    }, []);

    const resetFilter = useCallback(() => {
        setFilter(DEFAULT_FILTER);
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
        fetchRoles();
    }, [fetchRoles]);

    // Fetch on filter/page change
    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]); // fetchUsers dependency includes getQueryString, which includes filter/pagination

    return {
        // Data
        users, // Directly mapped, server-side paginated
        roles,
        loading,
        rolesLoading,
        submitting,

        // Filter
        filter,
        updateFilter,
        resetFilter,

        // Pagination
        pagination,
        totalPages: Math.ceil(pagination.total / pagination.limit),
        totalUsers: pagination.total,
        goToPage,
        setLimit,

        // Actions
        fetchUsers,
        fetchRoles,
        createUser,
        updateUser,
        deleteUser,
    };
}
