'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@cp/ui';
import { Icons } from '@cp/config/client';
import { ConfirmDialog, useConfig, PageLoadingSkeleton } from '@/modules/_core';
import { useTrash } from '../composables';

export const TrashView = () => {
    const router = useRouter();
    const { items, loading, restore, destroy } = useTrash();
    const { labels } = useConfig();
    const L = labels.mod.dataSources;

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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight flex items-center gap-3">
                        <Icons.trash className="w-8 h-8 text-red-500" />
                        {L.labels.trash}
                    </h1>
                    <p className="text-slate-500 text-sm leading-relaxed">
                        {L.labels.trashSubtitle}
                    </p>
                </div>
                <div>
                    <Button variant="outline" onClick={() => router.push('/data-sources')}>
                        <Icons.arrowLeft className="w-4 h-4 mr-2" /> {L.labels.backToDataSources}
                    </Button>
                </div>
            </div>

            {/* List */}
            <div className="grid gap-4">
                {items.length === 0 ? (
                    <div className="text-center py-20 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                        <div className="text-4xl mb-4 opacity-30 flex justify-center"><Icons.trash className="w-16 h-16 text-slate-400" /></div>
                        <h3 className="text-xl font-bold text-slate-700">{L.labels.trashEmpty}</h3>
                        <p className="text-slate-500 mt-2">{L.labels.trashEmptyDesc}</p>
                    </div>
                ) : (
                    items.map((item) => (
                        <div key={item.id} className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm hover:shadow-md transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                                    <Icons.database className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800">{item.name}</h3>
                                    <p className="text-sm text-slate-500">{L.labels.deletedAt}: {new Date(item.deletedAt || '').toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
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
                                    variant="danger"
                                    onClick={() => setConfirmDialog({ id: item.id, name: item.name, action: 'destroy' })}
                                >
                                    <Icons.trash className="w-4 h-4 mr-2" /> {L.labels.deletePermanently}
                                </Button>
                            </div>
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

