'use client';

/**
 * RolesTab - Extracted from legacy RolesView
 */

import { Button, Badge } from '@/components/ui';
import { Icons, MODULE_LABELS } from '@/lib/config/client';
import { useRoles } from '../composables/useRoles';
import { RoleModal } from './RoleModal';
import { PageLoadingSkeleton } from '@/modules/_core';
import type { Role } from '../types';

const L = MODULE_LABELS.rolesPermissions.roles;

export const RolesTab = () => {
    const {
        roles,
        loading,
        modalOpen,
        editingRole,
        deleteRole,
        handleEdit,
        handleCreate,
        handleModalClose,
        handleModalSuccess,
        isSystemRole,
        getLevelColor,
        getLevelBarColor,
    } = useRoles();

    if (loading) return <PageLoadingSkeleton showStats={false} contentRows={4} />;

    return (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            {/* Header Actions */}
            <div className="flex justify-end mb-8 mt-2">
                <Button onClick={handleCreate} size="default" className="gap-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]">
                    <Icons.plus className="w-5 h-5" /> {L.buttons.addRole}
                </Button>
            </div>

            {/* Roles Grid */}
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 pb-10">
                {roles.map((role: Role) => (
                    <div key={role.id} className="bg-white/70 backdrop-blur-xl rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-500 group relative overflow-hidden">
                        {/* Subtle glass reflection effect */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-white/20 to-transparent -mr-16 -mt-16 rounded-full blur-2xl" />
                        {/* Status indicators */}
                        <div className="absolute top-6 right-6 flex gap-2">
                             {role.is_active ? (
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                            ) : (
                                <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                            )}
                        </div>

                        {/* Role Header */}
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 duration-500 ${getLevelColor(role.level)}`}>
                                    {role.is_super ? <Icons.crown className="w-7 h-7" /> : <Icons.shield className="w-7 h-7" />}
                                </div>
                                <div className="space-y-0.5">
                                    <h3 className="font-semibold text-slate-800 text-lg leading-tight">{role.display_name || role.name}</h3>
                                    <p className="text-[10px] text-slate-400 font-medium uppercase">{role.name}</p>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        {role.description ? (
                            <p className="text-sm text-slate-500 mb-6 line-clamp-2 min-h-10 leading-relaxed italic">
                                "{role.description}"
                            </p>
                        ) : (
                            <div className="mb-6 h-10" />
                        )}

                        {/* Level Bar */}
                        <div className="mb-8 bg-slate-50/40 backdrop-blur-sm p-4 rounded-2xl">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-semibold text-slate-400 uppercase">{L.labels.level}</span>
                                <span className="text-sm font-semibold text-slate-700">{role.level} / 100</span>
                            </div>
                            <div className="h-1.5 bg-slate-200/40 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full transition-all duration-1000 ease-out ${getLevelBarColor(role.level)}`} style={{ width: `${Math.min(role.level, 100)}%` }} />
                            </div>
                        </div>

                        {/* Actions Overlay for non-system roles */}
                        <div className="flex gap-2.5">
                             {!isSystemRole(role.name) ? (
                                 <>
                                    <button onClick={() => handleEdit(role)} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/60 hover:bg-white text-slate-600 font-semibold text-xs transition-all shadow-sm">
                                        <Icons.pencil className="w-4 h-4" /> Edit
                                    </button>
                                    <button onClick={() => deleteRole(role)} className="flex items-center justify-center w-11 h-11 rounded-xl bg-white/60 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm">
                                        <Icons.trash className="w-4 h-4" />
                                    </button>
                                </>
                            ) : (
                                <button onClick={() => handleEdit(role)} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/60 hover:bg-white text-slate-500 font-semibold text-xs transition-all shadow-sm group/system">
                                    <Icons.pencil className="w-4 h-4 group-hover:text-indigo-500 transition-colors" /> Configure System Role
                                </button>
                            )}
                        </div>
                    </div>
                ))}

                {roles.length === 0 && (
                    <div className="col-span-full text-center py-20 text-slate-400 bg-white/50 rounded-[3rem] border border-slate-100 border-dashed">
                        <Icons.info className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p className="font-medium">{L.messages.empty}</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            <RoleModal isOpen={modalOpen} role={editingRole} onClose={handleModalClose} onSuccess={handleModalSuccess} />
        </div>
    );
};
