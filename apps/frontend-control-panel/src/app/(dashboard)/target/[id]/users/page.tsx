'use client';
import { use } from 'react';
import { AppUserManagementView } from '@/features-target/feature-target-app-users';

export default function TargetAppUsersPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  return <AppUserManagementView />;
}
