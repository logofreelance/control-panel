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

/**
 * GlobalLoading - Event-based trigger for loading states outside React
 */
export class GlobalLoading {
    private static listeners: ((loading: boolean) => void)[] = [];
    private static activeCount = 0;

    static start() {
        this.activeCount++;
        if (this.activeCount === 1) this.notify(true);
    }

    static stop() {
        this.activeCount = Math.max(0, this.activeCount - 1);
        if (this.activeCount === 0) this.notify(false);
    }

    static subscribe(listener: (loading: boolean) => void) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    private static notify(loading: boolean) {
        this.listeners.forEach(l => l(loading));
    }
}

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
    const [transitionNonce, setTransitionNonce] = useState(0);
    const [isGlobalBusy, setIsGlobalBusy] = useState(false);
    const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Calculate if any loader is still loading
    const isPageLoading = isTransitioning || isGlobalBusy || Object.values(loaders).some(loading => loading);

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

    // Listen for global loading events from ApiClient or others
    useEffect(() => {
        return GlobalLoading.subscribe(setIsGlobalBusy);
    }, []);

    // Listen for route changes to set transitioning state
    useEffect(() => {
        // Set transitioning on route change start (via patching history)
        const originalPushState = history.pushState;
        const originalReplaceState = history.replaceState;

        const handleRouteChange = (shouldTransition = true) => {
            setLoaders({}); // Clear all loaders on new navigation
            if (shouldTransition) {
                setIsTransitioning(true);
                setTransitionNonce(prev => prev + 1);
            }
        };

        history.pushState = function (...args) {
            handleRouteChange(true);
            return originalPushState.apply(this, args);
        };

        history.replaceState = function (...args) {
            handleRouteChange(true);
            return originalReplaceState.apply(this, args);
        };

        // For back/forward navigation, clear loaders but don't trigger 
        // artificial transition state to avoid sticking on cached pages.
        const handlePopState = () => handleRouteChange(false);
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
            if (transitionTimeoutRef.current) {
                clearTimeout(transitionTimeoutRef.current);
            }
            transitionTimeoutRef.current = setTimeout(() => {
                setIsTransitioning(false);
            }, 2000);
        }
        return () => {
            if (transitionTimeoutRef.current) {
                clearTimeout(transitionTimeoutRef.current);
            }
        };
    }, [isTransitioning, transitionNonce]);

    return (
        <PageLoadingContext.Provider value={{
            isPageLoading,
            setPageLoading,
            registerLoader,
            unregisterLoader,
            updateLoader
        }}>
            {children}
            
            {/* Unified Global Loading Overlay - FLAT REDESIGN */}
            {isPageLoading && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background animate-in fade-in duration-300">
                    <div className="flex flex-col items-center">
                        {/* Bold Single-Ring Flat Spinner */}
                        <div className="relative size-16 flex items-center justify-center">
                            {/* Main Thick Ring */}
                            <div className="absolute inset-0 border-[5px] border-primary/10 rounded-full" />
                            <div className="absolute inset-0 border-[5px] border-primary border-t-transparent rounded-full animate-spin [animation-duration:0.8s]" />
                        </div>
                    </div>
                </div>
            )}
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
