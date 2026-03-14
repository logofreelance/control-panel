'use client';

export const dynamic = 'force-dynamic';

import { DashboardView } from '@/modules/dashboard';

/**
 * Dashboard Page
 * 
 * Route: /
 * 
 * The DashboardView component handles its own loading state with skeleton.
 * No Suspense needed since we use useEffect for data fetching (not Suspense-compatible).
 */
export default function DashboardPage() {
    return <DashboardView />;
}
