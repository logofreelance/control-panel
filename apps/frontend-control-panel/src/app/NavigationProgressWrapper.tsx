'use client';

import { Suspense } from 'react';
import { NavigationProgress } from '@/modules/_core';

/**
 * NavigationProgressWrapper - Client component wrapper for NavigationProgress
 * 
 * Should be placed in root layout.
 * Wrapped in Suspense because it uses useSearchParams.
 */
export const NavigationProgressWrapper = () => {
    return (
        <Suspense fallback={null}>
            <NavigationProgress />
        </Suspense>
    );
};
