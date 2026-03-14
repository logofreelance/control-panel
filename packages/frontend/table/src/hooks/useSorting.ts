/**
 * @repo/frontend-table
 * 
 * Sorting hook - manages column sort state
 */

import { useState, useCallback } from 'react';

export type SortDirection = 'ASC' | 'DESC';

export interface UseSortingOptions {
    /** Initial sort column */
    initialColumn?: string;
    /** Initial sort direction */
    initialDirection?: SortDirection;
    /** Default direction when switching columns */
    defaultDirection?: SortDirection;
}

export interface UseSortingReturn {
    // State
    sortColumn: string | null;
    sortDirection: SortDirection;

    // Computed
    sortParams: { sort: string; order: SortDirection } | null;

    // Actions
    handleSort: (column: string) => void;
    setSort: (column: string, direction: SortDirection) => void;
    clearSort: () => void;

    // Helpers
    isSorted: (column: string) => boolean;
    getSortIcon: (column: string) => '▲' | '▼' | null;
}

/**
 * Hook for managing table sorting
 */
export function useSorting(options: UseSortingOptions = {}): UseSortingReturn {
    const {
        initialColumn = null,
        initialDirection = 'DESC',
        defaultDirection = 'DESC',
    } = options;

    const [sortColumn, setSortColumn] = useState<string | null>(initialColumn);
    const [sortDirection, setSortDirection] = useState<SortDirection>(initialDirection);

    const handleSort = useCallback((column: string) => {
        if (sortColumn === column) {
            // Toggle direction
            setSortDirection(prev => prev === 'DESC' ? 'ASC' : 'DESC');
        } else {
            // New column, use default direction
            setSortColumn(column);
            setSortDirection(defaultDirection);
        }
    }, [sortColumn, defaultDirection]);

    const setSort = useCallback((column: string, direction: SortDirection) => {
        setSortColumn(column);
        setSortDirection(direction);
    }, []);

    const clearSort = useCallback(() => {
        setSortColumn(null);
        setSortDirection(defaultDirection);
    }, [defaultDirection]);

    const isSorted = useCallback((column: string) => {
        return sortColumn === column;
    }, [sortColumn]);

    const getSortIcon = useCallback((column: string): '▲' | '▼' | null => {
        if (sortColumn !== column) return null;
        return sortDirection === 'ASC' ? '▲' : '▼';
    }, [sortColumn, sortDirection]);

    const sortParams = sortColumn
        ? { sort: sortColumn, order: sortDirection }
        : null;

    return {
        sortColumn,
        sortDirection,
        sortParams,
        handleSort,
        setSort,
        clearSort,
        isSorted,
        getSortIcon,
    };
}
