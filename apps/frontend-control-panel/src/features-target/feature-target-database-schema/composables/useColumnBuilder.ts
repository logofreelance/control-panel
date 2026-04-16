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
import { DEFAULTS } from '@/lib/config/defaults';
import type { ColumnDefinition } from '../types';
import { COLUMN_TYPES } from '../registry';

export interface UseColumnBuilderOptions {
    /** Initial columns */
    initialColumns?: ColumnDefinition[];
}

/**
 * Hook for managing column definitions in schema builder
 * Modularized: Uses internal API and local constants
 */
export function useColumnBuilder(options: UseColumnBuilderOptions = {}) {
    const { initialColumns = [] } = options;

    // Create a new empty column definition using defaults
    const createColumn = useMemo(() => (): ColumnDefinition => ({
        name: '',
        type: DEFAULTS.databaseSchema.columnBuilder.defaultType,
        required: false,
        unique: false,
    }), []);

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
                errors.push(`column name is required (column ${index + 1})`);
            }
            if (!col.type) {
                errors.push(`column type is required (column ${index + 1})`);
            }
            const typeInfo = getTypeInfo(col.type);
            if (typeInfo?.requiresValues && (!col.values || col.values.length === 0)) {
                errors.push(`values are required for ${typeInfo.label} column "${col.name}"`);
            }
            if (typeInfo?.requiresTarget && !col.target) {
                errors.push(`target table is required for ${typeInfo.label} column "${col.name}"`);
            }
        });

        // Check for duplicate names
        const names = list.items.map(c => c.name.toLowerCase()).filter(n => n);
        const duplicates = names.filter((n: any, i: any) => names.indexOf(n) !== i);
        if (duplicates.length > 0) {
            errors.push(`duplicate column names found: ${[...new Set(duplicates)].join(', ')}`);
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
