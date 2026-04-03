'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast, usePageLoading } from '@/modules/_core';
import { DYNAMIC_ROUTES_API } from '../../../api';
import { ApiCategory, ApiEndpoint } from '@/features-target/feature-dynamic-routes';
import { DYNAMIC_ROUTES_LABELS } from '../../../constants/ui-labels';

const L = DYNAMIC_ROUTES_LABELS.routeBuilder;

/**
 * useRouteBuilder composable
 * @param targetId - ID dari target system (wajib untuk header x-target-id)
 */
export function useRouteBuilder(targetId: string) {
    const { addToast } = useToast();
    const { setPageLoading } = usePageLoading();
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState<ApiCategory[]>([]);
    const [endpoints, setEndpoints] = useState<ApiEndpoint[]>([]);

    // Filter States
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

    // Modal States
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<ApiCategory | null>(null);
    const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });
    const [isSavingCategory, setIsSavingCategory] = useState(false);

    // Delete Confirmation States
    const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'category' | 'endpoint'; id: string; name: string } | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const [stats, setStats] = useState({ total: 0, active: 0, categories: 0, methods: 0 });

    // Sync loading state with global page loading
    useEffect(() => {
        setPageLoading(loading);
    }, [loading, setPageLoading]);

    // Helper: build headers with current targetId
    const getHeaders = useCallback(() => ({ 'x-target-id': targetId }), [targetId]);
    const getJsonHeaders = useCallback(() => ({ 'x-target-id': targetId, 'Content-Type': 'application/json' }), [targetId]);

    const fetchData = useCallback(async () => {
        const headers = getHeaders();
        try {
            const [catRes, endRes, statsRes] = await Promise.all([
                fetch(DYNAMIC_ROUTES_API.categories.list, { headers }),
                fetch(DYNAMIC_ROUTES_API.endpoints.list, { headers }),
                fetch(DYNAMIC_ROUTES_API.endpoints.stats, { headers })
            ]);

            const catData = await catRes.json();
            const endData = await endRes.json();
            const statsData = await statsRes.json();

            if (catData.status === 'success') setCategories(catData.data);
            if (endData.status === 'success') setEndpoints(endData.data);
            if (statsData.status === 'success') setStats(statsData.data);
        } catch (err) {
            console.error('[useRouteBuilder] fetchData error:', err);
            addToast(L.messages.fetchError || 'Failed to load data', 'error');
        } finally {
            setLoading(false);
        }
    }, [addToast, getHeaders]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSaveCategory = async () => {
        setIsSavingCategory(true);
        try {
            const payload = editingCategory
                ? { ...categoryForm, id: editingCategory.id }
                : categoryForm;
                
            console.log("Editing Category state:", editingCategory);
            console.log("Payload being sent:", payload);

            const res = await fetch(DYNAMIC_ROUTES_API.categories.save, {
                method: 'POST',
                headers: getJsonHeaders(),
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
        } finally {
            setIsSavingCategory(false);
        }
    };

    const executeDelete = async () => {
        if (!deleteConfirm) return;
        setDeleteLoading(true);
        try {
            const url = deleteConfirm.type === 'category'
                ? DYNAMIC_ROUTES_API.categories.delete(deleteConfirm.id)
                : DYNAMIC_ROUTES_API.endpoints.delete(deleteConfirm.id);
            const res = await fetch(url, { method: 'DELETE', headers: getHeaders() });
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

    const handleToggleEndpoint = async (id: string) => {
        try {
            // Find current endpoint to toggle its state
            const ep = endpoints.find(e => e.id === id);
            const res = await fetch(DYNAMIC_ROUTES_API.endpoints.toggle(id), {
                method: 'PUT',
                headers: getJsonHeaders(),
                body: JSON.stringify({ is_active: ep ? !ep.isActive : true })
            });
            const data = await res.json();
            if (data.status === 'success') {
                addToast(L.messages.endpointToggled || 'Endpoint status updated', 'success');
                fetchData();
            }
        } catch {
            addToast('Failed to toggle', 'error');
        }
    };

    const openDeleteConfirm = (type: 'category' | 'endpoint', id: string, name: string) => {
        setDeleteConfirm({ type, id, name });
    };

    const filteredEndpoints = endpoints.filter(ep => {
        if (searchQuery && !ep.path.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        if (selectedCategory && ep.categoryId !== selectedCategory) return false;
        if (selectedMethod && ep.method !== selectedMethod) return false;
        return true;
    });

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
        isSavingCategory,
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
