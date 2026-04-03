import { DashboardSkeleton } from '@/features-internal/feature-dashboard-main';

export default function Loading() {
    return (
        <div className="w-full h-full min-h-[60vh] flex flex-col pt-8">
            <DashboardSkeleton />
        </div>
    );
}
