'use client';

/**
 * PageLoadingProvider - Global page loading state management
 * 
 * This context ensures that the global loading overlay stays visible
 * until ALL data required by a page is fully loaded.
 * 
 * Usage in composables:
 * const { setPageLoading } = usePageLoading();
 * useEffect(() => { setPageLoading(loading); }, [loading]);
 */

import { createContext, useContext, useState, useCallback, useRef, useEffect, ReactNode } from 'react';
import { LABELS } from '@/lib/config/client';

interface PageLoadingContextType {
    isPageLoading: boolean;
    setPageLoading: (loading: boolean) => void;
    registerLoader: (id: string) => void;
    unregisterLoader: (id: string) => void;
    updateLoader: (id: string, loading: boolean) => void;
}

const PageLoadingContext = createContext<PageLoadingContextType | null>(null);

const L = LABELS.common.status;

interface PageLoadingProviderProps {
    children: ReactNode;
}

export const PageLoadingProvider = ({ children }: PageLoadingProviderProps) => {
    const [loaders, setLoaders] = useState<Record<string, boolean>>({});
    const [isTransitioning, setIsTransitioning] = useState(false);
    const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Calculate if any loader is still loading
    const isPageLoading = isTransitioning || Object.values(loaders).some(loading => loading);

    // Simple setter for single-loader pages
    const setPageLoading = useCallback((loading: boolean) => {
        setLoaders({ main: loading });
    }, []);

    // Register a new loader
    const registerLoader = useCallback((id: string) => {
        setLoaders(prev => ({ ...prev, [id]: true }));
    }, []);

    // Unregister a loader
    const unregisterLoader = useCallback((id: string) => {
        setLoaders(prev => {
            const next = { ...prev };
            delete next[id];
            return next;
        });
    }, []);

    // Update a specific loader's state
    const updateLoader = useCallback((id: string, loading: boolean) => {
        setLoaders(prev => ({ ...prev, [id]: loading }));
    }, []);

    // Listen for route changes to set transitioning state
    useEffect(() => {
        // Set transitioning on route change start (via patching history)
        const originalPushState = history.pushState;
        const originalReplaceState = history.replaceState;

        const handleRouteChange = () => {
            setIsTransitioning(true);
            setLoaders({}); // Clear all loaders on new navigation

            // Clear any existing timeout
            if (transitionTimeoutRef.current) {
                clearTimeout(transitionTimeoutRef.current);
            }
        };

        history.pushState = function (...args) {
            handleRouteChange();
            return originalPushState.apply(this, args);
        };

        history.replaceState = function (...args) {
            handleRouteChange();
            return originalReplaceState.apply(this, args);
        };

        // Also listen for popstate (back/forward buttons)
        const handlePopState = () => handleRouteChange();
        window.addEventListener('popstate', handlePopState);

        return () => {
            history.pushState = originalPushState;
            history.replaceState = originalReplaceState;
            window.removeEventListener('popstate', handlePopState);
            if (transitionTimeoutRef.current) {
                clearTimeout(transitionTimeoutRef.current);
            }
        };
    }, []);

    // When loaders are updated, check if we should end transition
    useEffect(() => {
        if (isTransitioning && Object.keys(loaders).length > 0) {
            // Loaders registered, end transition mode
            setIsTransitioning(false);
        }
    }, [loaders, isTransitioning]);

    // Timeout fallback - if no loaders register within 2 seconds, end transition
    useEffect(() => {
        if (isTransitioning) {
            transitionTimeoutRef.current = setTimeout(() => {
                setIsTransitioning(false);
            }, 2000);
        }
        return () => {
            if (transitionTimeoutRef.current) {
                clearTimeout(transitionTimeoutRef.current);
            }
        };
    }, [isTransitioning]);

    return (
        <PageLoadingContext.Provider value={{
            isPageLoading,
            setPageLoading,
            registerLoader,
            unregisterLoader,
            updateLoader
        }}>
            {children}
            {/* Global Locking Overlay Removed - Allowing Component Level Loading */}
        </PageLoadingContext.Provider>
    );
};

// Hook to use page loading context
export const usePageLoading = () => {
    const context = useContext(PageLoadingContext);
    if (!context) {
        // Return no-op functions if used outside provider (during SSR, etc)
        return {
            isPageLoading: false,
            setPageLoading: () => { },
            registerLoader: () => { },
            unregisterLoader: () => { },
            updateLoader: () => { },
        };
    }
    return context;
};
