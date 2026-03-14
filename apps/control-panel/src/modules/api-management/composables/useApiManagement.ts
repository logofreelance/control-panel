'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast, usePageLoading } from '@/modules/_core';
import { API_MANAGEMENT_API } from '../constants';
import { ApiCategory, ApiEndpoint } from '../types';
import { MODULE_LABELS } from '@cp/config';
import { fetchWithCsrf } from '@/lib/csrf';

const L = MODULE_LABELS.apiManagement;

export function useApiManagement() {
    const { addToast } = useToast();
    const { setPageLoading } = usePageLoading();
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState<ApiCategory[]>([]);
    const [endpoints, setEndpoints] = useState<ApiEndpoint[]>([]);

    // Filter States
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

    // Modal States
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<ApiCategory | null>(null);
    const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });

    // Delete Confirmation States
    const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'category' | 'endpoint'; id: number; name: string } | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const [stats, setStats] = useState({ total: 0, active: 0, categories: 0, methods: 0 });

    // Sync loading state with global page loading
    useEffect(() => {
        setPageLoading(loading);
    }, [loading, setPageLoading]);

    const fetchData = useCallback(async () => {
        try {
            const [catRes, endRes, statsRes] = await Promise.all([
                fetch(API_MANAGEMENT_API.categories.list),
                fetch(API_MANAGEMENT_API.endpoints.list),
                fetch(API_MANAGEMENT_API.endpoints.stats)
            ]);

            const catData = await catRes.json();
            const endData = await endRes.json();
            const statsData = await statsRes.json();

            if (catData.status === 'success') setCategories(catData.data);
            if (endData.status === 'success') setEndpoints(endData.data);
            if (statsData.status === 'success') setStats(statsData.data);
        } catch {
            addToast(L.messages.fetchError || 'Failed to load data', 'error');
        } finally {
            setLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSaveCategory = async () => {
        try {
            const payload = editingCategory
                ? { ...categoryForm, id: editingCategory.id }
                : categoryForm;

            const res = await fetchWithCsrf(API_MANAGEMENT_API.categories.save, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (data.status === 'success') {
                addToast(L.messages.categorySaved || 'Category saved', 'success');
                setIsCategoryModalOpen(false);
                fetchData();
            } else {
                addToast(data.message, 'error');
            }
        } catch {
            addToast(L.messages.saveError || 'Failed to save category', 'error');
        }
    };

    const executeDelete = async () => {
        if (!deleteConfirm) return;
        setDeleteLoading(true);
        try {
            const url = deleteConfirm.type === 'category'
                ? API_MANAGEMENT_API.categories.delete(deleteConfirm.id)
                : API_MANAGEMENT_API.endpoints.delete(deleteConfirm.id);
            const res = await fetchWithCsrf(url, { method: 'DELETE' });
            const data = await res.json();
            if (data.status === 'success') {
                const typeLabel = deleteConfirm.type === 'category' ? 'Category' : 'Endpoint';
                addToast(`${typeLabel} deleted`, 'success');
                fetchData();
                setDeleteConfirm(null);
            } else {
                addToast(data.message || 'Cannot delete', 'error');
            }
        } catch {
            addToast(L.messages.deleteError || 'Failed to delete', 'error');
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleToggleEndpoint = async (id: number) => {
        try {
            const res = await fetchWithCsrf(API_MANAGEMENT_API.endpoints.toggle(id), { method: 'POST' });
            const data = await res.json();
            if (data.status === 'success') {
                addToast(L.messages.endpointToggled || 'Endpoint status updated', 'success');
                fetchData();
            }
        } catch {
            addToast('Failed to toggle', 'error');
        }
    };

    const openDeleteConfirm = (type: 'category' | 'endpoint', id: number, name: string) => {
        setDeleteConfirm({ type, id, name });
    };

    const filteredEndpoints = endpoints.filter(ep => {
        if (searchQuery && !ep.path.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        if (selectedCategory && ep.categoryId !== selectedCategory) return false;
        if (selectedMethod && ep.method !== selectedMethod) return false;
        return true;
    });

    // Stats are now fetched from server
    // const stats = ...

    return {
        // State
        loading,
        categories,
        endpoints,
        filteredEndpoints,
        stats,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        selectedMethod,
        setSelectedMethod,
        isCategoryModalOpen,
        setIsCategoryModalOpen,
        editingCategory,
        setEditingCategory,
        categoryForm,
        setCategoryForm,
        deleteConfirm,
        setDeleteConfirm,
        deleteLoading,

        // Actions
        fetchData,
        handleSaveCategory,
        executeDelete,
        handleToggleEndpoint,
        openDeleteConfirm
    };
}
