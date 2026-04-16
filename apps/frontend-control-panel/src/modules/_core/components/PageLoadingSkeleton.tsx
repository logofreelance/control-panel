'use client';

/**
 * PageLoadingSkeleton - Global Loader Configuration
 * 
 * REPLACED ALL SKELETONS WITH MINIMALIST SPINNERS.
 * Unified loading experience across all page segments.
 */

import { LABELS } from '@/lib/config';

const L = LABELS.common.status;

export interface PageLoadingSkeletonProps {
    /** Show stats cards row (4 cards) - Ignored in new minimalist style */
    showStats?: boolean;
    /** Number of content rows to show - Ignored in new minimalist style */
    contentRows?: number;
    /** Show sidebar column - Ignored in new minimalist style */
    showSidebar?: boolean;
}

/**
 * Standard page loading - Minimalist replacement
 */
export const PageLoadingSkeleton = () => (
    <div className="w-full h-full min-h-[60vh] flex flex-col items-center justify-center animate-in fade-in duration-700">
        <div className="relative size-16 flex items-center justify-center">
            {/* Main Thick Ring */}
            <div className="absolute inset-0 border-[5px] border-primary/10 rounded-full" />
            <div className="absolute inset-0 border-[5px] border-primary border-t-transparent rounded-full animate-spin [animation-duration:0.8s]" />
        </div>
    </div>
);

/**
 * Compact loading spinner for smaller areas
 */
export const LoadingSpinner = () => (
    <div className="w-full flex items-center justify-center py-10">
        <div className="relative size-10">
            <div className="absolute inset-0 border-2 border-primary/10 rounded-full" />
            <div className="absolute inset-0 border-2 border-primary border-t-transparent animate-spin rounded-full" />
        </div>
    </div>
);

/**
 * Full page loading (centered spinner)
 */
export const FullPageLoading = () => <PageLoadingSkeleton />;
