// error-templates/composables/useErrorTemplates.ts
// Business logic for Error Templates module

import { useState, useEffect, useCallback } from 'react';
import { API_STATUS } from '@/lib/config';
import { DYNAMIC_ROUTES_LABELS } from '../../../constants/ui-labels';
import { useToast } from '@/modules/_core';
import { API } from '../api';
import type { ErrorTemplate, EditFormState, StatusCodeOption } from '../types';

const L = DYNAMIC_ROUTES_LABELS.errorTemplates;

// Status codes configuration
export const STATUS_CODES: StatusCodeOption[] = [
    { code: 400, label: L.statusCodes.badRequest },
    { code: 401, label: L.statusCodes.unauthorized },
    { code: 403, label: L.statusCodes.forbidden },
    { code: 404, label: L.statusCodes.notFound },
    { code: 500, label: L.statusCodes.serverError },
];

export function useErrorTemplates(targetId?: string) {
    const { addToast } = useToast();
    const [templates, setTemplates] = useState<ErrorTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<EditFormState>({ statusCode: 0, template: '' });

    const fetchTemplates = useCallback(async () => {
        try {
            const res = await fetch(API.global, {
                headers: targetId ? { 'x-target-id': targetId } : {}
            });
            const data = await res.json();
            if (data.status === API_STATUS.SUCCESS && data.data) {
                // Map from snake_case (DB) to camelCase (Frontend)
                const mapped = data.data.map((item: any) => ({
                    id: item.id,
                    statusCode: item.status_code || item.statusCode,
                    template: item.message_template || item.messageTemplate || item.template || ""
                }));
                setTemplates(mapped);
            }
        } catch {
            addToast(L.messages.loadFailed, 'error');
        }
        setLoading(false);
    }, [addToast, targetId]);

    useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

    const handleSave = async (statusCode: number, template: string) => {
        try {
            const res = await fetch(API.save, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    ...(targetId ? { 'x-target-id': targetId } : {})
                },
                body: JSON.stringify({
                    scope: API_STATUS.GLOBAL,
                    statusCode: statusCode,
                    title: "Error", // Default title for now
                    messageTemplate: template // Frontend variable 'template' matches backend's 'messageTemplate'
                })
            });
            const data = await res.json();
            if (data.status === API_STATUS.SUCCESS) {
                addToast(L.messages.saved, 'success');
                setEditingId(null);
                fetchTemplates();
            } else {
                addToast(data.message || L.messages.saveFailed, 'error');
            }
        } catch {
            addToast(L.messages.connectionError, 'error');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm(L.messages.confirmDelete)) return;
        try {
            const res = await fetch(API.delete(id), { 
                method: 'DELETE',
                headers: targetId ? { 'x-target-id': targetId } : {}
            });
            const data = await res.json();
            if (data.status === API_STATUS.SUCCESS) {
                addToast(L.messages.deleted, 'success');
                fetchTemplates();
            }
        } catch {
            addToast(L.messages.connectionError, 'error');
        }
    };

    const startEdit = (t: ErrorTemplate) => {
        setEditingId(t.id);
        setEditForm({ statusCode: t.statusCode, template: t.template });
    };

    const startNew = (statusCode: number, label: string) => {
        setEditingId(String(-statusCode));
        setEditForm({
            statusCode: statusCode,
            template: JSON.stringify({ status: API_STATUS.ERROR, code: statusCode, message: label }, null, 2)
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
    };

    const getStatusLabel = (code: number): string => {
        return STATUS_CODES.find(s => s.code === code)?.label || `Error ${code}`;
    };

    const getStatusColor = (code: number): 'danger' | 'warning' | 'slate' => {
        if (code >= 500) return 'danger';
        if (code >= 400) return 'warning';
        return 'slate';
    };

    const getTemplateForCode = (code: number) => {
        return templates.find(t => t.statusCode === code);
    };

    const saveCustomCode = () => {
        if (editForm.statusCode > 500 && editForm.template) {
            handleSave(editForm.statusCode, editForm.template);
            setEditForm({ statusCode: 0, template: '' });
        }
    };

    return {
        // State
        templates,
        loading,
        editingId,
        editForm,
        // Actions
        setEditForm,
        handleSave,
        handleDelete,
        startEdit,
        startNew,
        cancelEdit,
        saveCustomCode,
        // Helpers
        getStatusLabel,
        getStatusColor,
        getTemplateForCode,
    };
}
