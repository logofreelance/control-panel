/**
 * @repo/frontend-list-builder
 * 
 * Hook for managing dynamic lists with CRUD and reorder operations
 */

import { useState, useCallback } from 'react';

export interface UseListBuilderOptions<T> {
    /** Initial items */
    initialItems?: T[];
    /** Factory function to create new item */
    createItem?: () => T;
    /** Key to identify items (default: uses index) */
    idKey?: keyof T;
}

export interface UseListBuilderReturn<T> {
    // State
    items: T[];
    count: number;
    isEmpty: boolean;

    // Actions
    add: (item?: T) => void;
    addAt: (index: number, item?: T) => void;
    remove: (index: number) => void;
    removeById: (id: any) => void;
    update: (index: number, updates: Partial<T>) => void;
    updateField: (index: number, field: keyof T, value: any) => void;
    replace: (index: number, item: T) => void;
    move: (fromIndex: number, toIndex: number) => void;
    moveUp: (index: number) => void;
    moveDown: (index: number) => void;
    clear: () => void;
    reset: (items: T[]) => void;

    // Helpers
    getItem: (index: number) => T | undefined;
    findById: (id: any) => T | undefined;
    findIndex: (predicate: (item: T) => boolean) => number;
}

/**
 * Hook for managing dynamic list items
 */
export function useListBuilder<T extends Record<string, any>>(
    options: UseListBuilderOptions<T> = {}
): UseListBuilderReturn<T> {
    const { initialItems = [], createItem, idKey } = options;

    const [items, setItems] = useState<T[]>(initialItems);

    const count = items.length;
    const isEmpty = count === 0;

    // Add item at end
    const add = useCallback((item?: T) => {
        const newItem = item ?? (createItem ? createItem() : {} as T);
        setItems(prev => [...prev, newItem]);
    }, [createItem]);

    // Add item at specific index
    const addAt = useCallback((index: number, item?: T) => {
        const newItem = item ?? (createItem ? createItem() : {} as T);
        setItems(prev => {
            const next = [...prev];
            next.splice(index, 0, newItem);
            return next;
        });
    }, [createItem]);

    // Remove by index
    const remove = useCallback((index: number) => {
        setItems(prev => prev.filter((_, i) => i !== index));
    }, []);

    // Remove by ID
    const removeById = useCallback((id: any) => {
        if (!idKey) return;
        setItems(prev => prev.filter(item => item[idKey] !== id));
    }, [idKey]);

    // Partial update
    const update = useCallback((index: number, updates: Partial<T>) => {
        setItems(prev => prev.map((item, i) =>
            i === index ? { ...item, ...updates } : item
        ));
    }, []);

    // Update single field
    const updateField = useCallback((index: number, field: keyof T, value: any) => {
        setItems(prev => prev.map((item, i) =>
            i === index ? { ...item, [field]: value } : item
        ));
    }, []);

    // Replace entire item
    const replace = useCallback((index: number, item: T) => {
        setItems(prev => prev.map((existing, i) => i === index ? item : existing));
    }, []);

    // Move item from one index to another
    const move = useCallback((fromIndex: number, toIndex: number) => {
        setItems(prev => {
            const next = [...prev];
            const [item] = next.splice(fromIndex, 1);
            next.splice(toIndex, 0, item);
            return next;
        });
    }, []);

    // Move item up
    const moveUp = useCallback((index: number) => {
        if (index <= 0) return;
        move(index, index - 1);
    }, [move]);

    // Move item down
    const moveDown = useCallback((index: number) => {
        if (index >= items.length - 1) return;
        move(index, index + 1);
    }, [move, items.length]);

    // Clear all
    const clear = useCallback(() => {
        setItems([]);
    }, []);

    // Reset to specific items
    const reset = useCallback((newItems: T[]) => {
        setItems(newItems);
    }, []);

    // Get item by index
    const getItem = useCallback((index: number) => {
        return items[index];
    }, [items]);

    // Find by ID
    const findById = useCallback((id: any) => {
        if (!idKey) return undefined;
        return items.find(item => item[idKey] === id);
    }, [items, idKey]);

    // Find index by predicate
    const findIndex = useCallback((predicate: (item: T) => boolean) => {
        return items.findIndex(predicate);
    }, [items]);

    return {
        items,
        count,
        isEmpty,
        add,
        addAt,
        remove,
        removeById,
        update,
        updateField,
        replace,
        move,
        moveUp,
        moveDown,
        clear,
        reset,
        getItem,
        findById,
        findIndex,
    };
}
