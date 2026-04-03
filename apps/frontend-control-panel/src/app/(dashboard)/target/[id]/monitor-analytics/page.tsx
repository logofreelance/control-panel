'use client';
import { use } from 'react';
import { MonitorAnalyticsView } from '@/features-target/feature-monitor-analytics';

export default function TargetMonitorAnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  // MonitorAnalyticsView uses useParams internally, but passing id might be safer if updated.
  // For now, resolvedParams is unused but ensures compatibility.
  return <MonitorAnalyticsView />;
}
