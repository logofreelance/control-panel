'use client';

/**
 * PermissionsView - Permission management with groups
 * Create and manage granular permissions for RBAC
 * PURE DI: Uses @cp/config labels and Icons
 */

import { Button, Input } from '@cp/ui';
import { Icons, MODULE_LABELS } from '@cp/config/client';
import { usePermissions } from '../composables';
import { PageLoadingSkeleton } from '@/modules/_core';
import type { Permission } from '../types';

const L = MODULE_LABELS.permissions;

export const PermissionsView = () => {
    const {
        loading,
        grouped,
        permissions,
        showModal,
        setShowModal,
        form,
        setForm,
        createPermission,
        deletePermission,
    } = usePermissions();

    if (loading) return <PageLoadingSkeleton showStats={false} contentRows={4} />;

    return (
        <div className="animate-page-enter">
            <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">{L.title}</h1>
                    <p className="text-slate-500 text-sm mt-1 font-medium">{L.subtitle}</p>
                </div>
                <Button onClick={() => setShowModal(true)} size="md" className="gap-2">
                    <Icons.plus className="w-5 h-5" /> {L.buttons.addPermission}
                </Button>
            </section>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Object.entries(grouped).map(([group, perms]) => (
                    <div key={group} className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
                        <h3 className="text-xs font-bold text-slate-400 mb-4">{group}</h3>
                        <div className="space-y-3">
                            {(perms as Permission[]).map((p) => (
                                <div key={p.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl group hover:bg-slate-100 transition-colors">
                                    <div>
                                        <p className="font-bold text-sm text-slate-800">{p.name}</p>
                                        {p.description && <p className="text-xs text-slate-400 mt-0.5">{p.description}</p>}
                                    </div>
                                    <button onClick={() => deletePermission(p.id)} className="w-8 h-8 rounded-xl bg-white flex items-center justify-center hover:text-red-500 transition-colors">
                                        <Icons.trash className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
                {permissions.length === 0 && (
                    <div className="col-span-full text-center py-12 text-slate-400 bg-white rounded-[2rem] border border-slate-100">
                        {L.messages.empty}
                    </div>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl">
                        <h2 className="text-2xl font-bold mb-6">{L.modal.addTitle}</h2>
                        <form onSubmit={createPermission} className="space-y-5">
                            <Input label={L.modal.nameLabel} placeholder={L.labels.namePlaceholder} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                            <Input label={L.modal.groupLabel} placeholder={L.labels.groupPlaceholder} value={form.group} onChange={(e) => setForm({ ...form, group: e.target.value })} />
                            <Input label={L.modal.descriptionLabel} placeholder={L.labels.descriptionPlaceholder} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                            <div className="flex gap-3 pt-4">
                                <Button type="button" variant="slate" className="flex-1" onClick={() => setShowModal(false)}>{L.buttons.cancel}</Button>
                                <Button type="submit" className="flex-1">{L.buttons.create}</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

