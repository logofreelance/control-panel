'use client';
import { use } from 'react';
import { MonitorDatabaseView } from '@/features-target/feature-monitor-database';

export default function TargetMonitorDatabasePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  return <MonitorDatabaseView />;
}
