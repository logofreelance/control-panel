'use client';
import { use } from 'react';
import { TargetDashboardView } from '@/features-target/feature-target-dashboard';

export default function TargetDashboardPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  return <TargetDashboardView targetId={resolvedParams.id} />;
}
