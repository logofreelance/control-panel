'use client';

/**
 * NavigationProgress - Minimalist Top Progress Bar
 * 
 * Shows immediate visual feedback during page navigation by placing
 * a thin high-contrast line at the very top of the viewport.
 * Matches the Simetri aesthetic: clean, fast, and unobtrusive.
 */

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export const NavigationProgress = () => {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isNavigating, setIsNavigating] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // When pathname or search params change, navigation is complete
        setIsNavigating(false);
        setProgress(0);
    }, [pathname, searchParams]);

    // Listen for link clicks to show immediate feedback
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const link = target.closest('a');

            if (link && link.href && !link.href.startsWith('#') && !link.target) {
                try {
                    const url = new URL(link.href);
                    // Only show progress for internal navigation to different routes
                    if (url.origin === window.location.origin && url.pathname !== pathname) {
                        setIsNavigating(true);
                        setProgress(30); // Start at 30%
                    }
                } catch (err) {
                    // Ignore invalid URLs
                }
            }
        };

        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, [pathname]);

    // Animate progress while navigating
    useEffect(() => {
        if (isNavigating) {
            const timer = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 90) return 90; // Cap at 90% until done
                    return prev + (90 - prev) * 0.1; // Ease-in simulation
                });
            }, 200);
            return () => clearInterval(timer);
        }
    }, [isNavigating]);

    if (!isNavigating) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-10000 pointer-events-none">
            <div 
                className="h-[3px] bg-black transition-all duration-500 ease-out shadow-[0_0_10px_rgba(0,0,0,0.1)]"
                style={{ width: `${progress}%` }}
            />
        </div>
    );
};
