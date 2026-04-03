'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Heading, Text, Stack } from '@/components/ui';
import { Icons } from '../config/icons';
import { ConfirmDialog, useConfig, PageLoadingSkeleton } from '@/modules/_core';
import { useTrash } from '../composables';

export const DatabaseSchemaTrashView = () => {
    const router = useRouter();
    const { id: targetId } = useParams();
    const { items, loading, restore, destroy } = useTrash();
    const { labels } = useConfig();
    const L = labels.mod.databaseSchema;

    const [confirmDialog, setConfirmDialog] = useState<{
        id: number;
        name: string;
        action: 'restore' | 'destroy';
    } | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    const handleAction = async () => {
        if (!confirmDialog) return;
        setActionLoading(true);
        if (confirmDialog.action === 'restore') {
            await restore(confirmDialog.id);
        } else {
            await destroy(confirmDialog.id);
        }
        setActionLoading(false);
        setConfirmDialog(null);
    };

    if (loading) return <PageLoadingSkeleton showStats={false} contentRows={4} />;

    return (
        <div className="space-y-8 animate-page-enter">
            {/* Header */}
            <Stack direction="row" justify="between" align="center" className="flex-col md:flex-row gap-4">
                <div>
                    <Heading level={2} className="mb-2 tracking-tight flex items-center gap-3">
                        <Icons.trash className="w-8 h-8 text-red-500" />
                        {L.labels.trash}
                    </Heading>
                    <Text variant="muted">
                        {L.labels.trashSubtitle}
                    </Text>
                </div>
                <div>
                    <Button variant="outline" onClick={() => router.push(targetId ? `/target/${targetId}/database-schema` : '/database-schema')}>
                        <Icons.arrowLeft className="w-4 h-4 mr-2" /> {L.buttons.backToSchema}
                    </Button>
                </div>
            </Stack>

            {/* List */}
            <div className="grid gap-4">
                {items.length === 0 ? (
                    <div className="text-center py-20 bg-muted rounded-4xl border-2 border-dashed border-border">
                        <div className="text-4xl mb-4 opacity-30 flex justify-center"><Icons.trash className="w-16 h-16 text-muted-foreground" /></div>
                        <Heading level={5}>{L.labels.trashEmpty}</Heading>
                        <Text variant="muted" className="mt-2">{L.labels.trashEmptyDesc}</Text>
                    </div>
                ) : (
                    items.map((item) => (
                        <div key={item.id} className="bg-card rounded-4xl border border-border p-8 flex flex-col md:flex-row items-center justify-between gap-4 hover:bg-muted/30 transition-all">
                            <Stack direction="row" align="center" gap={4}>
                                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                                    <Icons.database className="w-6 h-6" />
                                </div>
                                <div>
                                    <Heading level={5}>{item.name}</Heading>
                                    <Text variant="muted" className="text-sm">{L.labels.deletedAt}: {new Date(item.deletedAt || '').toLocaleString()}</Text>
                                </div>
                            </Stack>
                            <Stack direction="row" gap={2}>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-emerald-600 hover:bg-emerald-50 border-emerald-200"
                                    onClick={() => setConfirmDialog({ id: item.id, name: item.name, action: 'restore' })}
                                >
                                    <Icons.refresh className="w-4 h-4 mr-2" /> {L.labels.restore}
                                </Button>
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => setConfirmDialog({ id: item.id, name: item.name, action: 'destroy' })}
                                >
                                    <Icons.trash className="w-4 h-4 mr-2" /> {L.labels.deletePermanently}
                                </Button>
                            </Stack>
                        </div>
                    ))
                )}
            </div>

            <ConfirmDialog
                isOpen={!!confirmDialog}
                onConfirm={handleAction}
                onClose={() => setConfirmDialog(null)}
                variant={confirmDialog?.action === 'destroy' ? 'danger' : 'info'}
                title={confirmDialog?.action === 'restore' ? L.messages.confirm.restoreSource : L.messages.confirm.destroySource}
                message={confirmDialog?.action === 'restore'
                    ? `${L.messages.confirm.confirmRestore} "${confirmDialog?.name}"?`
                    : `${L.messages.confirm.confirmDestroy} "${confirmDialog?.name}"?`}
                confirmText={confirmDialog?.action === 'restore' ? L.labels.restore : L.labels.deletePermanently}
                loading={actionLoading}
            />
        </div>
    );
};
