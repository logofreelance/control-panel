'use client';
import { use } from 'react';
import { ApiKeysAndCorsView } from '@/features-target/feature-client-api-keys';

export default function TargetApiKeysPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  return <ApiKeysAndCorsView targetId={resolvedParams.id} />;
}
