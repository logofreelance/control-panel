'use client';

/**
 * NavigationProgress - Shows immediate visual feedback during page navigation
 * 
 * This component listens to route changes and shows a progress bar
 * at the top of the page immediately when navigation starts.
 * 
 * PURE DI: Uses @cp/config
 */

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { LABELS } from '@cp/config/client';

export const NavigationProgress = () => {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isNavigating, setIsNavigating] = useState(false);

    useEffect(() => {
        // When pathname or search params change, navigation is complete
        setIsNavigating(false);
    }, [pathname, searchParams]);

    // Listen for link clicks to show immediate feedback
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const link = target.closest('a');

            if (link && link.href && !link.href.startsWith('#') && !link.target) {
                const url = new URL(link.href);
                // Only show progress for internal navigation
                if (url.origin === window.location.origin && url.pathname !== pathname) {
                    setIsNavigating(true);
                }
            }
        };

        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, [pathname]);

    if (!isNavigating) return null;

    return (
        <div className="fixed inset-0 z-[9999] bg-[#f8fafc] flex items-center justify-center animate-in fade-in duration-100">
            <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-3 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-slate-400 font-medium">{LABELS.common.status.loading}</span>
            </div>
        </div>
    );
};
