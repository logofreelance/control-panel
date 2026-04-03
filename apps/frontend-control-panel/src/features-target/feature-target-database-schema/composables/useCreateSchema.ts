/**
 * database-schema/composables/useCreateSource.ts
 * 
 * Create data source composable with validation
 * 
 * ✅ PURE DI: Uses useConfig() hook for all config, messages, and API
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '@/lib/frontend-api';
import { useToast, useConfig } from '@/modules/_core';
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
 * Uses Pure DI via useConfig() hook
 */
export function useCreateSchema() {
    // ✅ Pure DI: Get all dependencies from context
    const { msg, defaults, api, API_STATUS, TOAST_TYPE } = useConfig();
    const { addToast } = useToast();

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
    const [loadingTemplates, setLoadingTemplates] = useState(false); // Start false since we have defaults
    const [availableSources, setAvailableSources] = useState<{ label: string; value: string }[]>([]);

    // Fetch templates on mount
    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                // ✅ Use api from context
                const response = await apiClient.get<Template[]>(`${api.databaseSchema.list}/templates`);
                if (response.status === API_STATUS.SUCCESS && response.data) {
                    setTemplates(response.data);
                }
            } catch (err) {
                console.error('Failed to fetch templates:', err);
            } finally {
                setLoadingTemplates(false);
            }
        };
        fetchTemplates();
    }, [api, API_STATUS]);

    // Fetch available sources for relation column targets
    useEffect(() => {
        const fetchSources = async () => {
            try {
                // ✅ Use api from context
                const response = await apiClient.get<DatabaseTable[]>(api.databaseSchema.list);
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
    }, [api, API_STATUS]);

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
            // ✅ Use api from context
            // Note: /validate endpoint returns the result directly, not wrapped in {data: ...}
            const response = await apiClient.post<ValidationResult>(api.databaseSchema.validate, {
                tableName,
                schema: { columns, ...options },
            });

            // The response IS the validation result (may have data wrapper or not)
            // Use type guard or check property existence
            const result = 'data' in response && response.data ? (response.data as ValidationResult) : (response as unknown as ValidationResult);
            setValidationResult(result);
            return result;
        } catch (err) {
            console.error('Validation error:', err);
            return null;
        } finally {
            setValidating(false);
        }
    }, [api]);

    // Create database schema
    const create = useCallback(async (payload: CreateSchemaPayload): Promise<DatabaseTable | null> => {
        // Client-side validation using msg from context
        if (!payload.name.trim()) {
            addToast(msg.databaseSchema.validation.resourceNameRequired, TOAST_TYPE.ERROR);
            return null;
        }
        if (!payload.tableName.trim()) {
            addToast(msg.databaseSchema.validation.tableNameRequired, TOAST_TYPE.ERROR);
            return null;
        }
        if (payload.schema.columns.length === 0) {
            addToast(msg.databaseSchema.validation.minOneColumn, TOAST_TYPE.ERROR);
            return null;
        }

        setSubmitting(true);
        try {
            // ✅ Use api from context
            const response = await apiClient.post<DatabaseTable>(api.databaseSchema.save, payload);
            if (response.status === API_STATUS.SUCCESS && response.data) {
                // ✅ Use msg from context
                addToast(msg.databaseSchema.success.sourceCreated, TOAST_TYPE.SUCCESS);
                return response.data;
            } else {
                addToast((response as { message?: string }).message || msg.error.generic, TOAST_TYPE.ERROR);
            }
        } catch {
            addToast(msg.error.network, TOAST_TYPE.ERROR);
        } finally {
            setSubmitting(false);
        }
        return null;
    }, [addToast, msg, api, API_STATUS, TOAST_TYPE]);

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

        // Defaults from context
        defaultOptions: {
            timestamps: defaults.databaseSchema.schema.timestamps,
            softDelete: defaults.databaseSchema.schema.softDelete,
        },
    };
}
