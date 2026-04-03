'use client';

import { useState, useMemo, useCallback } from 'react';
import { useTargetRegistry } from '../hooks/useTargetRegistry';
import { filterTargets } from '../services/target-utils';
import type { TargetSystem, CreateTargetInput } from '../types/target-registry.types';

export function useTargetManagement() {
    const { targets, loading, saving, addTarget, editTarget, deleteTarget, testConnection, checkHealth } = useTargetRegistry();

    const [showModal, setShowModal] = useState(false);
    const [editingTarget, setEditingTarget] = useState<TargetSystem | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [checkingId, setCheckingId] = useState<string | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const handleAdd = useCallback(() => {
        setEditingTarget(null);
        setShowModal(true);
    }, []);

    const handleEdit = useCallback((t: TargetSystem) => {
        setEditingTarget(t);
        setShowModal(true);
    }, []);

    const handleSave = useCallback(async (data: CreateTargetInput) => {
        if (editingTarget) return editTarget(editingTarget.id, data);
        return addTarget(data);
    }, [editingTarget, editTarget, addTarget]);

    const handleDelete = useCallback((id: string) => setConfirmDeleteId(id), []);

    const executeDelete = useCallback(async () => {
        if (!confirmDeleteId) return;
        setDeletingId(confirmDeleteId);
        await deleteTarget(confirmDeleteId);
        setDeletingId(null);
        setConfirmDeleteId(null);
    }, [confirmDeleteId, deleteTarget]);

    const handleCheckHealth = useCallback(async (id: string) => {
        setCheckingId(id);
        await checkHealth(id);
        setCheckingId(null);
    }, [checkHealth]);

    const onlineCount = useMemo(
        () => targets.filter(t => t.status === 'online').length,
        [targets]
    );

    const filteredTargets = useMemo(
        () => filterTargets(targets, searchQuery),
        [targets, searchQuery]
    );

    return {
        targets,
        loading,
        saving,
        showModal,
        setShowModal,
        editingTarget,
        deletingId,
        checkingId,
        confirmDeleteId,
        setConfirmDeleteId,
        searchQuery,
        setSearchQuery,
        onlineCount,
        filteredTargets,
        handleAdd,
        handleEdit,
        handleSave,
        handleDelete,
        executeDelete,
        handleCheckHealth,
        testConnection,
    };
}
