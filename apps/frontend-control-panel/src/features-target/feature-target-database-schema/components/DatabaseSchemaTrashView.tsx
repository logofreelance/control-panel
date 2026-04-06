'use client';

/**
 * DatabaseSchemaTrashView - Flat Luxury Refactor
 * Integrated with TargetLayout
 */

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Badge, Card, CardContent } from '@/components/ui';
import { TextHeading } from '@/components/ui/text-heading';
import { Icons, MODULE_LABELS } from '@/lib/config/client';
import { ConfirmDialog, useConfig, PageLoadingSkeleton } from '@/modules/_core';
import { TargetLayout } from '@/components/layout/TargetLayout';
import { useTrash } from '../composables';
import { cn } from '@/lib/utils';

const L = MODULE_LABELS.databaseSchema;

export const DatabaseSchemaTrashView = () => {
    const router = useRouter();
    const params = useParams();
    const nodeId = params.id as string;
    const { items, loading, restore, destroy } = useTrash();

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
        <TargetLayout>
            <div className="flex flex-col gap-10 animate-page-enter">
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
                    <div className="flex items-center gap-4">
                        <div className="size-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                            <Icons.trash className="size-6" />
                        </div>
                        <div className="space-y-1">
                            <TextHeading as="h1" size="h3">{L.labels.trash}</TextHeading>
                            <p className="text-sm text-muted-foreground lowercase">{L.labels.trashSubtitle.toLowerCase()}</p>
                        </div>
                    </div>
                    <Button 
                        variant="ghost" 
                        className="rounded-xl border border-border/20 lowercase h-10 hover:bg-muted/50"
                        onClick={() => router.push(nodeId ? `/target/${nodeId}/database-schema` : '/database-schema')}
                    >
                        <Icons.back className="size-4 mr-2" /> {L.buttons.backToSchema}
                    </Button>
                </header>

                {/* Trash List */}
                <div className="space-y-4 px-1 pb-10">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center text-center py-24 bg-muted/20 rounded-3xl border border-dashed border-border/40">
                            <div className="size-20 rounded-3xl bg-muted/40 flex items-center justify-center mb-6">
                                <Icons.trash className="size-10 text-muted-foreground/30" />
                            </div>
                            <TextHeading size="h5" className="mb-2">{L.labels.trashEmpty.toLowerCase()}</TextHeading>
                            <p className="text-sm text-muted-foreground lowercase">{L.labels.trashEmptyDesc.toLowerCase()}</p>
                        </div>
                    ) : (
                        items.map((item) => (
                            <Card key={item.id} className="border-none shadow-sm bg-card hover:bg-muted/5 transition-all duration-300">
                                <CardContent className="p-5 flex flex-col md:flex-row items-center justify-between gap-6">
                                    <div className="flex items-center gap-5 flex-1 min-w-0">
                                        <div className="size-12 rounded-2xl bg-muted/40 flex items-center justify-center text-muted-foreground shrink-0">
                                            <Icons.database className="size-6" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <TextHeading size="h5" className="text-base font-semibold truncate lowercase mb-1">
                                                {item.name}
                                            </TextHeading>
                                            <p className="text-xs text-muted-foreground lowercase font-medium">
                                                {L.labels.deletedAt}: {new Date(item.deletedAt || '').toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-9 rounded-xl px-4 text-xs font-semibold lowercase text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/10 hover:border-emerald-500/40 transition-all"
                                            onClick={() => setConfirmDialog({ id: item.id, name: item.name, action: 'restore' })}
                                        >
                                            <Icons.refresh className="size-3.5 mr-2" /> {L.labels.restore}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-9 rounded-xl px-4 text-xs font-bold lowercase text-rose-500 hover:bg-rose-500/10 transition-all"
                                            onClick={() => setConfirmDialog({ id: item.id, name: item.name, action: 'destroy' })}
                                        >
                                            <Icons.delete className="size-3.5 mr-2" /> {L.labels.deletePermanently}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>

                <ConfirmDialog
                    isOpen={!!confirmDialog}
                    onConfirm={handleAction}
                    onClose={() => setConfirmDialog(null)}
                    variant={confirmDialog?.action === 'destroy' ? 'danger' : 'info'}
                    title={confirmDialog?.action === 'restore' ? `restore schema?` : `destroy permanently?`}
                    message={confirmDialog?.action === 'restore'
                        ? `${L.messages.confirm.confirmRestore} "${confirmDialog?.name}"?`.toLowerCase()
                        : `${L.messages.confirm.confirmDestroy} "${confirmDialog?.name}"?`.toLowerCase()}
                    confirmText={confirmDialog?.action === 'restore' ? L.labels.restore : L.labels.deletePermanently}
                    loading={actionLoading}
                />
            </div>
        </TargetLayout>
    );
};
