/**
 * data-sources/composables/useResourceForm.ts
 * 
 * Resource form state management using @cp/frontend-form-utils and @cp/frontend-list-builder
 * 
 * ✅ PURE DI: Uses useConfig() hook for all config, messages, and API
 */

'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useForm, useAutoSlug } from '@cp/frontend-form-utils';
import { useListBuilder } from '@cp/frontend-list-builder';
import { useConfig } from '@/modules/_core';
import type { Resource } from '../types';

export interface ResourceFormValues {
    name: string;
    slug: string;
    description: string;
    isPublic: boolean;
    isActive: boolean;
    defaultLimit: number;
    maxLimit: number;
    orderBy: string;
    orderDirection: 'ASC' | 'DESC';
}

export interface FieldSelection {
    name: string;
    selected: boolean;
    alias?: string;
}

export interface FilterConfig {
    field: string;
    operator: string;
    value: string;
    isRequired: boolean;
}

export interface JoinConfig {
    table: string;
    alias: string;
    type: 'LEFT' | 'INNER' | 'RIGHT';
    on: [string, string];
}

/**
 * Hook for managing resource form state
 * Uses Pure DI via useConfig() hook
 */
export function useResourceForm(resource?: Resource) {
    // ✅ Pure DI: Get all dependencies from context
    const { msg, defaults } = useConfig();

    // Get defaults from context
    const DEFAULT_VALUES: ResourceFormValues = useMemo(() => ({
        name: '',
        slug: '',
        description: '',
        isPublic: defaults.dataSources.resourceForm.isPublic,
        isActive: defaults.dataSources.resourceForm.isActive,
        defaultLimit: defaults.dataSources.resourceForm.defaultLimit,
        maxLimit: defaults.dataSources.resourceForm.maxLimit,
        orderBy: defaults.dataSources.resourceForm.orderBy,
        orderDirection: defaults.dataSources.resourceForm.orderDirection,
    }), [defaults]);

    // Main form using @cp/frontend-form-utils
    const form = useForm<ResourceFormValues>({
        initialValues: resource ? {
            name: resource.name,
            slug: resource.slug || '',
            description: resource.description || '',
            isPublic: resource.isPublic || defaults.dataSources.resourceForm.isPublic,
            isActive: resource.isActive !== false,
            defaultLimit: resource.defaultLimit || defaults.dataSources.resourceForm.defaultLimit,
            maxLimit: resource.maxLimit || defaults.dataSources.resourceForm.maxLimit,
            orderBy: resource.orderBy || defaults.dataSources.resourceForm.orderBy,
            orderDirection: resource.orderDirection || defaults.dataSources.resourceForm.orderDirection,
        } : DEFAULT_VALUES,
    });

    // Auto-slug generation
    const { slug, setSlug, isManual, setManual } = useAutoSlug({
        source: form.values.name,
        enabled: !resource, // Only auto-generate for new resources
    });

    // Sync slug to form
    useEffect(() => {
        if (!isManual) {
            form.setFieldValue('slug', slug);
        }
    }, [slug, isManual, form]);

    // Handle manual slug edit
    const handleSlugChange = useCallback((value: string) => {
        setSlug(value);
        setManual(true);
        form.setFieldValue('slug', value);
    }, [setSlug, setManual, form]);

    // Fields selection state
    const [selectedFields, setSelectedFields] = useState<string[]>(() => {
        if (resource?.fieldsJson) {
            try {
                const parsed = JSON.parse(resource.fieldsJson);
                return Array.isArray(parsed) ? parsed : [];
            } catch {
                return [];
            }
        }
        return [];
    });

    const toggleField = useCallback((fieldName: string) => {
        setSelectedFields(prev =>
            prev.includes(fieldName)
                ? prev.filter(f => f !== fieldName)
                : [...prev, fieldName]
        );
    }, []);

    const selectAllFields = useCallback((fields: string[]) => {
        setSelectedFields(fields);
    }, []);

    const clearFields = useCallback(() => {
        setSelectedFields([]);
    }, []);

    // Filters using @cp/frontend-list-builder
    const filters = useListBuilder<FilterConfig>({
        initialItems: resource?.filtersJson ? (() => {
            try {
                const parsed = JSON.parse(resource.filtersJson);
                return parsed.filters || parsed || [];
            } catch {
                return [];
            }
        })() : [],
        createItem: () => ({
            field: '',
            operator: 'eq',
            value: '',
            isRequired: false,
        }),
    });

    // Joins using @cp/frontend-list-builder
    const joins = useListBuilder<JoinConfig>({
        initialItems: resource?.joinsJson ? (() => {
            try {
                return JSON.parse(resource.joinsJson) || [];
            } catch {
                return [];
            }
        })() : [],
        createItem: () => ({
            table: '',
            alias: '',
            type: 'LEFT' as const,
            on: ['', ''] as [string, string],
        }),
    });

    // Build final payload for API
    const buildPayload = useCallback(() => {
        return {
            ...form.values,
            fieldsJson: JSON.stringify(selectedFields),
            filtersJson: JSON.stringify({ filters: filters.items }),
            joinsJson: JSON.stringify(joins.items),
        };
    }, [form.values, selectedFields, filters.items, joins.items]);

    // Validation using msg from context
    const validate = useCallback((): { valid: boolean; errors: string[] } => {
        const errors: string[] = [];

        if (!form.values.name.trim()) {
            // ✅ Use msg from context
            errors.push(msg.dataSources.validation.resourceNameRequired);
        }
        if (!form.values.slug.trim()) {
            errors.push(msg.dataSources.validation.slugRequired);
        }
        if (selectedFields.length === 0) {
            errors.push(msg.dataSources.validation.fieldsRequired);
        }

        return { valid: errors.length === 0, errors };
    }, [form.values, selectedFields, msg]);

    return {
        // Form values
        form,
        handleSlugChange,

        // Fields
        selectedFields,
        toggleField,
        selectAllFields,
        clearFields,

        // Filters (from useListBuilder)
        filters,

        // Joins (from useListBuilder)
        joins,

        // Helpers
        buildPayload,
        validate,
        isEditing: !!resource,
    };
}
