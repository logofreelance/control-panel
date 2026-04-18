/**
 * database-schema/composables/useResourceForm.ts
 * 
 * Resource form state management using @repo/frontend-form-utils and @repo/frontend-list-builder
 * 
 * ✅ PURE DI: Uses useConfig() hook for all config, messages, and API
 */

'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useForm, useAutoSlug } from '@/lib/frontend-form-utils';
import { useListBuilder } from '@/lib/frontend-list-builder';
import { FEATURE_MESSAGES } from '../constants';
import { DEFAULTS } from '@/lib/config/defaults';
import type { Resource, JoinConfig } from '../types';

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



/**
 * Hook for managing resource form state
 * Modularized: Uses internal API and local constants
 */
export function useResourceForm(resource?: Resource) {
    // Get defaults directly
    const DEFAULT_VALUES: ResourceFormValues = useMemo(() => ({
        name: '',
        slug: '',
        description: '',
        isPublic: DEFAULTS.databaseSchema.resourceForm.isPublic,
        isActive: DEFAULTS.databaseSchema.resourceForm.isActive,
        defaultLimit: DEFAULTS.databaseSchema.resourceForm.defaultLimit,
        maxLimit: DEFAULTS.databaseSchema.resourceForm.maxLimit,
        orderBy: DEFAULTS.databaseSchema.resourceForm.orderBy,
        orderDirection: DEFAULTS.databaseSchema.resourceForm.orderDirection,
    }), []);

    // Main form using @repo/frontend-form-utils
    const form = useForm<ResourceFormValues>({
        initialValues: resource ? {
            name: resource.name,
            slug: resource.slug || '',
            description: resource.description || '',
            isPublic: resource.isPublic || DEFAULTS.databaseSchema.resourceForm.isPublic,
            isActive: resource.isActive !== false,
            defaultLimit: resource.defaultLimit || DEFAULTS.databaseSchema.resourceForm.defaultLimit,
            maxLimit: resource.maxLimit || DEFAULTS.databaseSchema.resourceForm.maxLimit,
            orderBy: resource.orderBy || DEFAULTS.databaseSchema.resourceForm.orderBy,
            orderDirection: resource.orderDirection || DEFAULTS.databaseSchema.resourceForm.orderDirection,
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

    // Filters using @repo/frontend-list-builder
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

    // Joins using @repo/frontend-list-builder
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

    // Validation
    const validate = useCallback((): { valid: boolean; errors: string[] } => {
        const errors: string[] = [];

        if (!form.values.name.trim()) {
            errors.push(FEATURE_MESSAGES.validation.resourceNameRequired);
        }
        if (!form.values.slug.trim()) {
            errors.push(FEATURE_MESSAGES.validation.slugRequired);
        }
        if (selectedFields.length === 0) {
            errors.push(FEATURE_MESSAGES.validation.fieldsRequired);
        }

        return { valid: errors.length === 0, errors };
    }, [form.values, selectedFields]);

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
