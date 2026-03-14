/**
 * @repo/frontend-modal
 * 
 * Hook for managing modal open/close state
 */

import { useState, useCallback } from 'react';

export interface UseModalReturn<T = any> {
    // State
    isOpen: boolean;
    data: T | null;

    // Actions
    open: (data?: T) => void;
    close: () => void;
    toggle: () => void;

    // For passing to modal components
    modalProps: {
        isOpen: boolean;
        onClose: () => void;
    };
}

/**
 * Hook for managing modal visibility state
 */
export function useModal<T = any>(initialOpen = false): UseModalReturn<T> {
    const [isOpen, setIsOpen] = useState(initialOpen);
    const [data, setData] = useState<T | null>(null);

    const open = useCallback((modalData?: T) => {
        setData(modalData ?? null);
        setIsOpen(true);
    }, []);

    const close = useCallback(() => {
        setIsOpen(false);
        // Delay clearing data for exit animations
        setTimeout(() => setData(null), 300);
    }, []);

    const toggle = useCallback(() => {
        setIsOpen(prev => !prev);
    }, []);

    return {
        isOpen,
        data,
        open,
        close,
        toggle,
        modalProps: {
            isOpen,
            onClose: close,
        },
    };
}
