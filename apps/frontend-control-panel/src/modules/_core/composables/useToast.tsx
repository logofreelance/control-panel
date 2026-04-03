'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
    expiresAt: number;
}

interface ToastContextValue {
    toasts: Toast[];
    addToast: (message: string, type?: ToastType) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);
const STORAGE_KEY = 'app_toasts';
const TOAST_DURATION = 4000;

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    // Load persisted toasts on mount
    useEffect(() => {
        try {
            const stored = sessionStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed: Toast[] = JSON.parse(stored);
                const now = Date.now();
                // Filter out expired toasts
                const validToasts = parsed.filter(t => t.expiresAt > now);
                if (validToasts.length > 0) {
                    setToasts(validToasts);
                    // Set up timers for remaining toasts
                    validToasts.forEach(toast => {
                        const remaining = toast.expiresAt - now;
                        if (remaining > 0) {
                            setTimeout(() => removeToast(toast.id), remaining);
                        }
                    });
                }
                // Clear storage after reading
                sessionStorage.removeItem(STORAGE_KEY);
            }
        } catch {
            // Ignore storage errors
        }
    }, []);

    // Persist toasts before page unload
    useEffect(() => {
        const handleBeforeUnload = () => {
            if (toasts.length > 0) {
                sessionStorage.setItem(STORAGE_KEY, JSON.stringify(toasts));
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [toasts]);

    const addToast = useCallback((message: string, type: ToastType = 'success') => {
        const id = Math.random().toString(36).substring(2, 9);
        const expiresAt = Date.now() + TOAST_DURATION;
        const newToast: Toast = { id, message, type, expiresAt };

        setToasts(prev => [...prev, newToast]);

        // Auto remove after duration
        setTimeout(() => removeToast(id), TOAST_DURATION);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
            {children}
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}
