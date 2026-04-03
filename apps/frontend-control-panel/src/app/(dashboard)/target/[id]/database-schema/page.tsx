'use client';
import { use } from 'react';
import { DatabaseSchemaListPage } from '@/features-target/feature-target-database-schema/pages';

export default function TargetDatabaseSchemaPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  return <DatabaseSchemaListPage />;
}
