'use client';
import { use } from 'react';
import { RolesPermissionsView } from '@/features-target/feature-target-roles-permissions';

export default function TargetRolesPermissionsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  return <RolesPermissionsView />;
}
