/**
 * database-schema/composables/useCreateSource.ts
 * 
 * Create data source composable with validation
 * 
 * ✅ PURE DI: Uses useConfig() hook for all config, messages, and API
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { apiClient } from '@/lib/frontend-api';
import { useToast } from '@/modules/_core';
import { API } from '../api/endpoints';
import { FEATURE_MESSAGES } from '../constants';
import { TOAST_TYPE, API_STATUS } from '@/lib/config/defaults';
import type { ColumnDefinition, DatabaseTable } from '../types';

export interface CreateSchemaPayload {
    name: string;
    tableName: string;
    description?: string;
    schema: {
        columns: ColumnDefinition[];
        timestamps: boolean;
        softDelete: boolean;
    };
}

export interface ValidationResult {
    valid: boolean;
    sanitizedTableName?: string;
    errors?: string[];
}

export interface Template {
    id: string;
    name: string;
    icon: string;
    description: string;
    schema: {
        columns: ColumnDefinition[];
        timestamps?: boolean;
    };
}

/**
 * Hook for managing database schema creation
 * Modularized: Uses internal API and local FEATURE_MESSAGES
 */
export function useCreateSchema() {
    const { addToast } = useToast();
    const params = useParams();
    const targetId = (params?.id as string) || '';
    const getHeaders = useCallback(() => {
        const h: Record<string, string> = {};
        if (targetId) h['x-target-id'] = targetId;
        return h;
    }, [targetId]);

    const [submitting, setSubmitting] = useState(false);
    const [validating, setValidating] = useState(false);
    const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
    
    // Default templates to ensure UI is not empty
    const DEFAULT_TEMPLATES: Template[] = [
        {
            id: 'blog',
            name: 'Blog Post',
            icon: '📝',
            description: 'Standard blog post schema with title, content, slug, and status.',
            schema: {
                columns: [
                    { name: 'title', type: 'string', required: true },
                    { name: 'slug', type: 'slug', unique: true, target: 'title' },
                    { name: 'content', type: 'text' },
                    { name: 'status', type: 'status', values: ['draft', 'published'] },
                    { name: 'published_at', type: 'datetime' }
                ],
                timestamps: true
            }
        },
        {
            id: 'products',
            name: 'Product Catalog',
            icon: '🛍️',
            description: 'E-commerce product definition with price, SKU, and inventory.',
            schema: {
                columns: [
                    { name: 'name', type: 'string', required: true },
                    { name: 'sku', type: 'string', unique: true },
                    { name: 'price', type: 'decimal', required: true },
                    { name: 'stock', type: 'integer', default: '0' },
                    { name: 'category', type: 'string' }
                ],
                timestamps: true
            }
        },
        {
            id: 'users',
            name: 'User Profile',
            icon: '👤',
            description: 'Extended user profile information linked to system users.',
            schema: {
                columns: [
                    { name: 'user_id', type: 'integer', unique: true, required: true },
                    { name: 'full_name', type: 'string' },
                    { name: 'bio', type: 'text' },
                    { name: 'avatar_url', type: 'string' },
                    { name: 'phone', type: 'string' }
                ],
                timestamps: true
            }
        },
        {
            id: 'tasks',
            name: 'Task Tracker',
            icon: '✅',
            description: 'Simple project management tasks with priority and due dates.',
            schema: {
                columns: [
                    { name: 'title', type: 'string', required: true },
                    { name: 'priority', type: 'status', values: ['low', 'medium', 'high'] },
                    { name: 'is_completed', type: 'boolean', default: 'false' },
                    { name: 'due_date', type: 'date' }
                ],
                timestamps: true
            }
        }
    ];

    const [templates, setTemplates] = useState<Template[]>(DEFAULT_TEMPLATES);
    const [loadingTemplates, setLoadingTemplates] = useState(false);
    const [availableSources, setAvailableSources] = useState<{ label: string; value: string }[]>([]);

    // Fetch templates on mount
    useEffect(() => {
        const fetchTemplates = async () => {
            setLoadingTemplates(true);
            try {
                const response = await apiClient.get<Template[]>(API.pageSchemaCreate.templates, { headers: getHeaders() });
                if (response.status === API_STATUS.SUCCESS && Array.isArray(response.data) && response.data.length > 0) {
                    setTemplates(response.data);
                }
            } catch (err) {
                console.error('Failed to fetch templates:', err);
            } finally {
                setLoadingTemplates(false);
            }
        };
        fetchTemplates();
    }, [getHeaders]);

    // Fetch available sources for relation column targets
    useEffect(() => {
        const fetchSources = async () => {
            try {
                const response = await apiClient.get<DatabaseTable[]>(API.pageSchemaCreate.existingTables, { headers: getHeaders() });
                if (response.status === API_STATUS.SUCCESS && response.data) {
                    setAvailableSources(
                        response.data.map((s: any) => ({
                            label: s.name,
                            value: s.tableName,
                        }))
                    );
                }
            } catch (err) {
                console.error('Failed to fetch database schemas:', err);
            }
        };
        fetchSources();
    }, [getHeaders]);

    // Validate table name and schema
    const validate = useCallback(async (
        tableName: string,
        columns: ColumnDefinition[],
        options: { timestamps: boolean; softDelete: boolean }
    ): Promise<ValidationResult | null> => {
        if (!tableName) {
            setValidationResult(null);
            return null;
        }

        setValidating(true);
        try {
            const response = await apiClient.post<ValidationResult>(API.pageSchemaCreate.validate, {
                tableName,
                schema: { columns, ...options },
            }, { headers: getHeaders(), transformRequest: false });

            const result = 'data' in response && response.data ? (response.data as ValidationResult) : (response as unknown as ValidationResult);
            setValidationResult(result);
            return result;
        } catch (err) {
            console.error('Validation error:', err);
            return null;
        } finally {
            setValidating(false);
        }
    }, [getHeaders]);

    // Create database schema
    const create = useCallback(async (payload: CreateSchemaPayload): Promise<DatabaseTable | null> => {
        if (!payload.name.trim() || !payload.tableName.trim() || payload.schema.columns.length === 0) {
            addToast('Please fill all required fields and add at least one column', TOAST_TYPE.ERROR);
            return null;
        }

        setSubmitting(true);
        try {
            const response = await apiClient.post<DatabaseTable>(API.pageSchemaCreate.submit, payload, { headers: getHeaders(), transformRequest: false });
            if (response.status === API_STATUS.SUCCESS && response.data) {
                addToast(FEATURE_MESSAGES.success.sourceCreated, TOAST_TYPE.SUCCESS);
                return response.data;
            } else {
                addToast((response as { message?: string }).message || 'Failed to create schema', TOAST_TYPE.ERROR);
            }
        } catch {
            addToast('Network error, please try again', TOAST_TYPE.ERROR);
        } finally {
            setSubmitting(false);
        }
        return null;
    }, [addToast, getHeaders]);

    // Generate table name from display name
    const generateTableName = useCallback((displayName: string): string => {
        return displayName
            .toLowerCase()
            .replace(/[^a-z0-9_]/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_|_$/g, '');
    }, []);

    return {
        // State
        submitting,
        validating,
        validationResult,
        templates,
        loadingTemplates,
        availableSources,

        // Actions
        validate,
        create,
        generateTableName,

        // Default options
        defaultOptions: {
            timestamps: true,
            softDelete: true,
        },
    };
}
