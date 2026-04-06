'use client';
import { use } from 'react';
import { TargetDashboardView } from '@/features-target/feature-target-dashboard';

export default function TargetDashboardPage({ params }: { params: Promise<{ id: string }> }) {
  return <TargetDashboardView />;
}
