'use client';

/**
 * RolesView - Role management with permissions
 * PURE DI: Uses @cp/config labels and Icons
 */

import { Button, Badge } from '@cp/ui';
import { Icons, MODULE_LABELS } from '@cp/config/client';
import { useRoles } from '../composables';
import { RoleModal } from './RoleModal';
import { PageLoadingSkeleton } from '@/modules/_core';
import type { Role } from '../types';

const L = MODULE_LABELS.roles;

export const RolesView = () => {
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
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">{L.title}</h1>
                    <p className="text-slate-500 text-sm mt-1 font-medium">{L.subtitle}</p>
                </div>
                <Button onClick={handleCreate} size="md" className="gap-2">
                    <Icons.plus className="w-5 h-5" /> {L.buttons.addRole}
                </Button>
            </section>

            {/* Roles Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {roles.map((role: Role) => (
                    <div key={role.id} className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                        {/* Role Header */}
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${getLevelColor(role.level)}`}>
                                    {role.is_super ? <Icons.crown className="w-6 h-6" /> : <Icons.shield className="w-6 h-6" />}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800">{role.display_name || role.name}</h3>
                                    <p className="text-xs text-slate-400 font-mono">{role.name}</p>
                                </div>
                            </div>
                            {!isSystemRole(role.name) && (
                                <div className="flex gap-1">
                                    <button onClick={() => handleEdit(role)} className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition-colors">
                                        <Icons.pencil className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => deleteRole(role)} className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-red-50 flex items-center justify-center text-slate-500 hover:text-red-500 transition-colors">
                                        <Icons.trash className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                            {isSystemRole(role.name) && (
                                <button onClick={() => handleEdit(role)} className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition-colors">
                                    <Icons.pencil className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* Description */}
                        {role.description && (
                            <p className="text-sm text-slate-500 mb-4 line-clamp-2">{role.description}</p>
                        )}

                        {/* Level Bar */}
                        <div className="mb-4">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-bold text-slate-400">{L.labels.level}</span>
                                <span className="text-xs font-bold text-slate-600">{role.level}</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full transition-all ${getLevelBarColor(role.level)}`} style={{ width: `${Math.min(role.level, 100)}%` }} />
                            </div>
                        </div>

                        {/* Badges */}
                        <div className="flex flex-wrap gap-2">
                            {role.is_super && (
                                <Badge variant="danger" className="text-xs gap-1">
                                    <Icons.unlock className="w-3 h-3" /> {L.labels.superAdmin}
                                </Badge>
                            )}
                            {role.is_active ? (
                                <Badge variant="success" className="text-xs">{L.labels.activeRole}</Badge>
                            ) : (
                                <Badge variant="slate" className="text-xs">{L.labels.inactiveRole}</Badge>
                            )}
                        </div>

                        {/* Permissions Preview */}
                        {role.permissions && (
                            <div className="mt-4 pt-4 border-t border-slate-100">
                                <p className="text-xs font-bold text-slate-400 mb-2">{L.labels.permissions}</p>
                                <div className="flex flex-wrap gap-1">
                                    {JSON.parse(role.permissions).slice(0, 3).map((perm: string, i: number) => (
                                        <span key={i} className="px-2 py-0.5 bg-slate-50 text-slate-500 rounded text-xs">{perm}</span>
                                    ))}
                                    {JSON.parse(role.permissions).length > 3 && (
                                        <span className="px-2 py-0.5 bg-slate-50 text-slate-400 rounded text-xs">
                                            +{JSON.parse(role.permissions).length - 3}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {roles.length === 0 && (
                    <div className="col-span-full text-center py-12 text-slate-400 bg-white rounded-[2rem] border border-slate-100">
                        {L.messages.empty}
                    </div>
                )}
            </div>

            {/* Modal */}
            <RoleModal isOpen={modalOpen} role={editingRole} onClose={handleModalClose} onSuccess={handleModalSuccess} />
        </div>
    );
};

