'use client';

import { LABELS } from '@cp/config/client';

/**
 * Next.js App Router Loading UI
 * 
 * Provides IMMEDIATE feedback when navigating between routes.
 * Using the exact same styling as PageLoadingProvider for visual consistency.
 */
export default function Loading() {
    return (
        <div className="fixed inset-0 bg-[#f8fafc] flex items-center justify-center z-[9998]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-3 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-slate-400 font-medium">{LABELS.common.status.loading}</span>
            </div>
        </div>
    );
}
