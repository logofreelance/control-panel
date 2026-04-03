/**
 * database-schema/composables/useColumnBuilder.ts
 * 
 * Column list management using @repo/frontend-list-builder
 * 
 * ✅ PURE DI: Uses useConfig() hook for all config, messages, and API
 */

'use client';

import { useMemo } from 'react';
import { useListBuilder } from '@/lib/frontend-list-builder';
import { useConfig } from '@/modules/_core';
import type { ColumnDefinition } from '../types';
import { COLUMN_TYPES } from '../registry';

export interface UseColumnBuilderOptions {
    /** Initial columns */
    initialColumns?: ColumnDefinition[];
}

/**
 * Hook for managing column definitions in schema builder
 * Uses Pure DI via useConfig() hook
 */
export function useColumnBuilder(options: UseColumnBuilderOptions = {}) {
    const { initialColumns = [] } = options;
    // ✅ Pure DI: Get all dependencies from context
    const { msg, defaults } = useConfig();

    // Create a new empty column definition using defaults from context
    const createColumn = useMemo(() => (): ColumnDefinition => ({
        name: '',
        type: defaults.databaseSchema.columnBuilder.defaultType,
        required: false,
        unique: false,
    }), [defaults]);

    const list = useListBuilder<ColumnDefinition>({
        initialItems: initialColumns,
        createItem: createColumn,
    });

    // Helper to get column type info
    const getTypeInfo = (typeValue: string) => {
        return COLUMN_TYPES.find(t => t.value === typeValue);
    };

    // Validate columns before submit
    const validate = (): { valid: boolean; errors: string[] } => {
        const errors: string[] = [];

        list.items.forEach((col: any, index: any) => {
            if (!col.name.trim()) {
                // ✅ Use msg from context
                errors.push(`${msg.databaseSchema.validation.columnNameRequired} (Column ${index + 1})`);
            }
            if (!col.type) {
                errors.push(`${msg.databaseSchema.validation.columnTypeRequired} (Column ${index + 1})`);
            }
            const typeInfo = getTypeInfo(col.type);
            if (typeInfo?.requiresValues && (!col.values || col.values.length === 0)) {
                errors.push(msg.databaseSchema.validation.columnValuesRequired(col.name, typeInfo.label));
            }
            if (typeInfo?.requiresTarget && !col.target) {
                errors.push(msg.databaseSchema.validation.columnTargetRequired(col.name, typeInfo.label));
            }
        });

        // Check for duplicate names
        const names = list.items.map(c => c.name.toLowerCase()).filter(n => n);
        const duplicates = names.filter((n: any, i: any) => names.indexOf(n) !== i);
        if (duplicates.length > 0) {
            errors.push(msg.databaseSchema.validation.duplicateColumnNames([...new Set(duplicates)]));
        }

        return { valid: errors.length === 0, errors };
    };

    return {
        // From useListBuilder
        columns: list.items,
        count: list.count,
        isEmpty: list.isEmpty,
        add: list.add,
        remove: list.remove,
        update: list.update,
        updateField: list.updateField,
        moveUp: list.moveUp,
        moveDown: list.moveDown,
        reset: list.reset,
        clear: list.clear,

        // Additional helpers
        getTypeInfo,
        validate,
        columnTypes: COLUMN_TYPES,
    };
}
