'use client';

/**
 * PermissionsTab - Extracted from legacy PermissionsView
 */

import { Button, Input } from '@/components/ui';
import { Icons, MODULE_LABELS } from '@/lib/config/client';
import { usePermissions } from '../composables/usePermissions';
import { PageLoadingSkeleton } from '@/modules/_core';
import { PermissionModal } from './PermissionModal';
import type { Permission } from '../types';

const L = MODULE_LABELS.rolesPermissions.permissions;

export const PermissionsTab = () => {
    const {
        permissions,
        grouped,
        loading,
        showModal,
        setShowModal,
        form,
        setForm,
        editingPermission,
        handleCreate,
        handleEdit,
        createPermission,
        updatePermission,
        deletePermission,
    } = usePermissions();

    if (loading) return <PageLoadingSkeleton showStats={false} contentRows={4} />;

    return (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            {/* Header Actions */}
            <div className="flex justify-end mb-8 mt-2">
                <Button onClick={handleCreate} size="default" className="gap-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]">
                    <Icons.plus className="w-5 h-5" /> {L.buttons.addPermission}
                </Button>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 pb-10">
                {Object.entries(grouped).map(([group, perms]) => (
                    <div key={group} className="bg-white/70 backdrop-blur-xl rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-500 flex flex-col relative group">
                        <div className="p-6 bg-slate-50/30 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-white/50 flex items-center justify-center">
                                <Icons.tag className="w-4 h-4 text-slate-400" />
                            </div>
                            <h3 className="text-[10px] font-semibold text-slate-500 uppercase">{group}</h3>
                        </div>
                        
                        <div className="p-6 space-y-3 flex-1">
                            {(perms as Permission[]).map((p) => (
                                <div key={p.id} className="flex items-center justify-between p-4 bg-white/50 rounded-2xl group/item hover:bg-white hover:shadow-xs transition-all duration-300">
                                    <div className="flex-1 min-w-0 pr-3">
                                        <p className="font-semibold text-sm text-slate-800 truncate">{p.name}</p>
                                        {p.description && <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1 opacity-70 italic">{p.description}</p>}
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => handleEdit(p)} 
                                            className="w-10 h-10 rounded-xl bg-white/40 flex items-center justify-center text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 transition-all"
                                        >
                                            <Icons.pencil className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => deletePermission(p.id)} 
                                            className="w-10 h-10 rounded-xl bg-white/40 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
                                        >
                                            <Icons.trash className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
                
                {permissions.length === 0 && (
                    <div className="col-span-full text-center py-20 text-slate-400 bg-white/50 rounded-[3rem] border border-slate-100 border-dashed">
                        <Icons.info className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p className="font-medium">{L.messages.empty}</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            <PermissionModal 
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                permission={editingPermission}
                form={form}
                setForm={setForm}
                onSubmit={editingPermission ? updatePermission : createPermission}
            />
        </div>
    );
};
