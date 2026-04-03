'use client';

export const dynamic = 'force-dynamic';

import { DatabaseSchemaTrashView } from '@/features-target/feature-target-database-schema/components/DatabaseSchemaTrashView';

export default function TrashPage() {
    return <DatabaseSchemaTrashView />;
}
