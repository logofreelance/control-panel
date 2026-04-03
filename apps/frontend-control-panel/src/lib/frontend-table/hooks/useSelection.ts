/**
 * @repo/frontend-table
 * 
 * Selection hook - manages row selection for bulk actions
 */

import { useState, useMemo, useCallback } from 'react';

export interface UseSelectionOptions<T> {
    /** Key to use as identifier (default: 'id') */
    idKey?: keyof T;
    /** Initial selected IDs */
    initialSelection?: (string | number)[];
}

export interface UseSelectionReturn<T> {
    // State
    selectedIds: (string | number)[];
    selectedCount: number;

    // Computed
    isAllSelected: boolean;
    isPartiallySelected: boolean;
    isEmpty: boolean;

    // Actions
    select: (id: string | number) => void;
    deselect: (id: string | number) => void;
    toggle: (id: string | number) => void;
    selectAll: (items: T[]) => void;
    deselectAll: () => void;
    toggleAll: (items: T[]) => void;

    // Helpers
    isSelected: (id: string | number) => boolean;
    getSelectedItems: (items: T[]) => T[];
}

/**
 * Hook for managing row selection in tables
 */
export function useSelection<T extends Record<string, any>>(
    options: UseSelectionOptions<T> = {}
): UseSelectionReturn<T> {
    const { idKey = 'id' as keyof T, initialSelection = [] } = options;

    const [selectedIds, setSelectedIds] = useState<(string | number)[]>(initialSelection);

    const selectedCount = selectedIds.length;
    const isEmpty = selectedCount === 0;

    const isSelected = useCallback((id: string | number) => {
        return selectedIds.includes(id);
    }, [selectedIds]);

    const select = useCallback((id: string | number) => {
        setSelectedIds(prev => prev.includes(id) ? prev : [...prev, id]);
    }, []);

    const deselect = useCallback((id: string | number) => {
        setSelectedIds(prev => prev.filter(i => i !== id));
    }, []);

    const toggle = useCallback((id: string | number) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    }, []);

    const selectAll = useCallback((items: T[]) => {
        const ids = items.map(item => item[idKey] as string | number);
        setSelectedIds(ids);
    }, [idKey]);

    const deselectAll = useCallback(() => {
        setSelectedIds([]);
    }, []);

    const toggleAll = useCallback((items: T[]) => {
        const ids = items.map(item => item[idKey] as string | number);
        const allSelected = ids.every(id => selectedIds.includes(id));
        setSelectedIds(allSelected ? [] : ids);
    }, [idKey, selectedIds]);

    const getSelectedItems = useCallback((items: T[]) => {
        return items.filter(item => selectedIds.includes(item[idKey] as string | number));
    }, [idKey, selectedIds]);

    // These need current items to calculate accurately
    // We'll use a factory pattern for these
    const createIsAllSelected = useCallback((itemCount: number) => {
        return itemCount > 0 && selectedCount === itemCount;
    }, [selectedCount]);

    const createIsPartiallySelected = useCallback((itemCount: number) => {
        return selectedCount > 0 && selectedCount < itemCount;
    }, [selectedCount]);

    return {
        selectedIds,
        selectedCount,
        // These are placeholders - components should use with current item count
        isAllSelected: false,
        isPartiallySelected: false,
        isEmpty,
        select,
        deselect,
        toggle,
        selectAll,
        deselectAll,
        toggleAll,
        isSelected,
        getSelectedItems,
    };
}
