'use client';
import { use } from 'react';
import { TargetRoutesLayout } from '@/features-target/feature-dynamic-routes';

export default function TargetRoutesPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  return <TargetRoutesLayout targetId={resolvedParams.id} />;
}
