'use client';

/**
 * PageLoadingSkeleton - Unified loading skeleton for all module views
 * 
 * Provides consistent loading experience across all pages.
 * Uses animate-pulse for subtle loading animation.
 * 
 * PURE DI: Uses @repo/config labels
 */

import { LABELS } from '@/lib/config';

const L = LABELS.common.status;

export interface PageLoadingSkeletonProps {
    /** Show stats cards row (4 cards) */
    showStats?: boolean;
    /** Number of content rows to show */
    contentRows?: number;
    /** Show sidebar column */
    showSidebar?: boolean;
}

/**
 * Standard page loading skeleton
 * Matches the visual structure of module views
 */
export const PageLoadingSkeleton = ({
    showStats = true,
    contentRows = 5,
    showSidebar = false
}: PageLoadingSkeletonProps = {}) => (
    <div className="space-y-8 animate-pulse">
        {/* Header Skeleton */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
                <div className="h-10 w-64 bg-slate-200 rounded-xl mb-2" />
                <div className="h-4 w-48 bg-slate-100 rounded-lg" />
            </div>
            <div className="flex gap-3">
                <div className="h-10 w-28 bg-slate-200 rounded-xl" />
            </div>
        </header>

        {/* Stats Cards Skeleton */}
        {showStats && (
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                        <div className="h-3 w-20 bg-slate-100 rounded mb-4" />
                        <div className="h-8 w-16 bg-slate-200 rounded" />
                    </div>
                ))}
            </section>
        )}

        {/* Content Grid */}
        <div className={`grid gap-8 ${showSidebar ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {/* Main Content */}
            <div className={`bg-white rounded-4xl border border-slate-100 shadow-sm overflow-hidden ${showSidebar ? 'lg:col-span-2' : ''}`}>
                {/* Toolbar */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <div className="h-10 w-48 bg-slate-100 rounded-xl" />
                    <div className="flex gap-2">
                        <div className="h-10 w-24 bg-slate-100 rounded-xl" />
                    </div>
                </div>

                {/* Content Rows */}
                <div className="divide-y divide-slate-100">
                    {Array.from({ length: contentRows || 5 }).map((_, i) => (
                        <div key={i} className="p-5 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-slate-100 shrink-0" />
                            <div className="flex-1">
                                <div className="h-4 w-48 bg-slate-200 rounded mb-2" />
                                <div className="h-3 w-32 bg-slate-100 rounded" />
                            </div>
                            <div className="h-8 w-20 bg-slate-100 rounded-lg shrink-0" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Sidebar */}
            {showSidebar && (
                <div className="space-y-6">
                    <div className="bg-slate-900 rounded-3xl p-6 h-56" />
                    <div className="bg-white rounded-3xl p-6 h-48 border border-slate-100 shadow-sm" />
                </div>
            )}
        </div>

        {/* Loading Indicator */}
        <div className="flex items-center justify-center py-4 gap-3">
            <div className="w-5 h-5 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-slate-400 font-medium">{L.loading}</span>
        </div>
    </div>
);

/**
 * Compact loading spinner for smaller areas
 */
export const LoadingSpinner = () => (
    <div className="h-64 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[var(--primary)] border-t-transparent animate-spin rounded-full" />
    </div>
);

/**
 * Full page loading (centered spinner)
 */
export const FullPageLoading = () => (
    <div className="h-96 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-[var(--primary)] border-t-transparent animate-spin rounded-full" />
            <span className="text-sm text-slate-400 font-medium">{L.loading}</span>
        </div>
    </div>
);
