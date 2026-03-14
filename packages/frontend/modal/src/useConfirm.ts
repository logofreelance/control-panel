/**
 * @repo/frontend-modal
 * 
 * Hook for managing confirmation dialogs
 */

import { useState, useCallback } from 'react';

export interface UseConfirmOptions {
    /** Title text */
    title?: string;
    /** Message text */
    message?: string;
    /** Confirm button text */
    confirmText?: string;
    /** Cancel button text */
    cancelText?: string;
    /** Variant: 'danger' | 'warning' | 'info' */
    variant?: 'danger' | 'warning' | 'info';
}

export interface UseConfirmReturn<T = any> {
    // State
    isOpen: boolean;
    target: T | null;
    options: UseConfirmOptions;
    loading: boolean;

    // Actions
    confirm: (target: T, options?: UseConfirmOptions) => void;
    cancel: () => void;
    setLoading: (loading: boolean) => void;

    // For passing to dialog components
    dialogProps: {
        isOpen: boolean;
        onClose: () => void;
        onConfirm: () => void;
        title: string;
        message: string;
        confirmText: string;
        cancelText: string;
        variant: 'danger' | 'warning' | 'info';
        loading: boolean;
    };
}

const defaultOptions: UseConfirmOptions = {
    title: 'Confirm Action',
    message: 'Are you sure you want to continue?',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    variant: 'danger',
};

/**
 * Hook for managing confirmation dialogs
 */
export function useConfirm<T = any>(
    onConfirm?: (target: T) => void | Promise<void>
): UseConfirmReturn<T> {
    const [isOpen, setIsOpen] = useState(false);
    const [target, setTarget] = useState<T | null>(null);
    const [options, setOptions] = useState<UseConfirmOptions>(defaultOptions);
    const [loading, setLoading] = useState(false);

    const confirm = useCallback((confirmTarget: T, confirmOptions?: UseConfirmOptions) => {
        setTarget(confirmTarget);
        setOptions({ ...defaultOptions, ...confirmOptions });
        setIsOpen(true);
    }, []);

    const cancel = useCallback(() => {
        setIsOpen(false);
        setLoading(false);
        setTimeout(() => {
            setTarget(null);
            setOptions(defaultOptions);
        }, 300);
    }, []);

    const handleConfirm = useCallback(async () => {
        if (!target || !onConfirm) {
            cancel();
            return;
        }

        setLoading(true);
        try {
            await onConfirm(target);
            cancel();
        } catch (error) {
            setLoading(false);
            throw error;
        }
    }, [target, onConfirm, cancel]);

    return {
        isOpen,
        target,
        options,
        loading,
        confirm,
        cancel,
        setLoading,
        dialogProps: {
            isOpen,
            onClose: cancel,
            onConfirm: handleConfirm,
            title: options.title || defaultOptions.title!,
            message: options.message || defaultOptions.message!,
            confirmText: options.confirmText || defaultOptions.confirmText!,
            cancelText: options.cancelText || defaultOptions.cancelText!,
            variant: options.variant || defaultOptions.variant!,
            loading,
        },
    };
}
