/**
 * @repo/frontend-option-selector
 * 
 * Hook for managing option selection state (single or multi)
 */

import { useState, useCallback, useMemo } from 'react';

export interface Option<T = string> {
    value: T;
    label: string;
    icon?: string;
    description?: string;
    disabled?: boolean;
}

export interface UseOptionSelectorOptions<T> {
    /** Available options */
    options: Option<T>[];
    /** Initial selected value(s) */
    initialValue?: T | T[];
    /** Allow multiple selections */
    multiple?: boolean;
    /** Required selection */
    required?: boolean;
}

export interface UseOptionSelectorReturn<T> {
    // State
    selected: T | T[] | null;
    selectedOption: Option<T> | Option<T>[] | null;

    // Actions
    select: (value: T) => void;
    deselect: (value: T) => void;
    toggle: (value: T) => void;
    clear: () => void;
    selectAll: () => void;

    // Helpers
    isSelected: (value: T) => boolean;
    getOption: (value: T) => Option<T> | undefined;

    // For rendering
    options: Option<T>[];
    getOptionProps: (option: Option<T>) => {
        selected: boolean;
        disabled: boolean;
        onClick: () => void;
    };
}

/**
 * Hook for managing option selection (single or multi-select)
 */
export function useOptionSelector<T = string>(
    options: UseOptionSelectorOptions<T>
): UseOptionSelectorReturn<T> {
    const {
        options: optionsList,
        initialValue,
        multiple = false,
        required = false,
    } = options;

    const [selected, setSelected] = useState<T | T[] | null>(() => {
        if (initialValue !== undefined) {
            return initialValue;
        }
        return multiple ? [] : null;
    });

    const isSelected = useCallback((value: T) => {
        if (multiple && Array.isArray(selected)) {
            return selected.includes(value);
        }
        return selected === value;
    }, [selected, multiple]);

    const select = useCallback((value: T) => {
        if (multiple) {
            setSelected(prev => {
                const current = Array.isArray(prev) ? prev : [];
                if (current.includes(value)) return current;
                return [...current, value];
            });
        } else {
            setSelected(value);
        }
    }, [multiple]);

    const deselect = useCallback((value: T) => {
        if (multiple) {
            setSelected(prev => {
                const current = Array.isArray(prev) ? prev : [];
                const next = current.filter(v => v !== value);
                // If required and would be empty, don't allow
                if (required && next.length === 0) return current;
                return next;
            });
        } else {
            if (!required) {
                setSelected(null);
            }
        }
    }, [multiple, required]);

    const toggle = useCallback((value: T) => {
        if (isSelected(value)) {
            deselect(value);
        } else {
            select(value);
        }
    }, [isSelected, select, deselect]);

    const clear = useCallback(() => {
        if (required) return;
        setSelected(multiple ? [] : null);
    }, [multiple, required]);

    const selectAll = useCallback(() => {
        if (!multiple) return;
        const enabledValues = optionsList
            .filter(opt => !opt.disabled)
            .map(opt => opt.value);
        setSelected(enabledValues);
    }, [multiple, optionsList]);

    const getOption = useCallback((value: T) => {
        return optionsList.find(opt => opt.value === value);
    }, [optionsList]);

    const selectedOption = useMemo(() => {
        if (multiple && Array.isArray(selected)) {
            return selected.map(v => getOption(v)).filter(Boolean) as Option<T>[];
        }
        if (selected !== null) {
            return getOption(selected as T) || null;
        }
        return null;
    }, [selected, multiple, getOption]);

    const getOptionProps = useCallback((option: Option<T>) => ({
        selected: isSelected(option.value),
        disabled: !!option.disabled,
        onClick: () => {
            if (!option.disabled) {
                toggle(option.value);
            }
        },
    }), [isSelected, toggle]);

    return {
        selected,
        selectedOption,
        select,
        deselect,
        toggle,
        clear,
        selectAll,
        isSelected,
        getOption,
        options: optionsList,
        getOptionProps,
    };
}
