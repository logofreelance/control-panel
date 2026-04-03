'use client';

/**
 * RoleModal - Unified create/edit role form for roles-permissions feature
 */

import { Button, Input, Badge, Modal } from '@/components/ui';
import { Icons, MODULE_LABELS } from '@/lib/config/client';
import { useRoleModal } from '../composables/useRoleModal';
import type { Role, Permission } from '../types';

const L = MODULE_LABELS.rolesPermissions.roles;

interface RoleModalProps {
    isOpen: boolean;
    role: Role | null;
    onClose: () => void;
    onSuccess: () => void;
}

export const RoleModal = ({ isOpen, role, onClose, onSuccess }: RoleModalProps) => {
    const {
        loading,
        form,
        setForm,
        groupedPermissions,
        handleSubmit,
        togglePermission,
    } = useRoleModal(isOpen, role, onSuccess);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={role ? L.modal.editTitle : L.modal.addTitle}
        >
            <form onSubmit={handleSubmit} className="space-y-10">
                {/* Basic Info Section */}
                <div className="space-y-6">
                    <h3 className="text-[10px] font-semibold text-slate-400 uppercase flex items-center gap-2">
                         <Icons.info className="w-4 h-4 text-indigo-400" /> Basic Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label={L.modal.nameLabel}
                            placeholder={L.labels.namePlaceholder}
                            value={form.name}
                            onChange={(e) => setForm({ name: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                            required
                            disabled={!!role}
                        />
                        <Input
                            label={L.modal.displayNameLabel}
                            placeholder={L.labels.displayNamePlaceholder}
                            value={form.displayName}
                            onChange={(e) => setForm({ displayName: e.target.value })}
                        />
                    </div>

                    <Input
                        label={L.modal.descriptionLabel}
                        placeholder={L.labels.descriptionPlaceholder}
                        value={form.description}
                        onChange={(e) => setForm({ description: e.target.value })}
                    />
                </div>

                {/* Security Level Section */}
                <div className="space-y-6 pt-4">
                    <h3 className="text-[10px] font-semibold text-slate-400 uppercase flex items-center gap-2">
                         <Icons.shield className="w-4 h-4 text-emerald-400" /> Access Level & Security
                    </h3>
                    
                    <div className="bg-slate-50 p-6 rounded-2xl space-y-6">
                        {/* Level Slider */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <label className="text-sm font-semibold text-slate-700">
                                    {L.modal.levelLabel}
                                </label>
                                <Badge variant="default" className="text-[10px] px-3 py-1 rounded-full bg-slate-900 text-white border-0 shadow-sm">{form.level}</Badge>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={form.level}
                                onChange={(e) => setForm({ level: parseInt(e.target.value) })}
                                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                            />
                        </div>

                        <div className={`flex items-center gap-4 p-5 rounded-xl transition-all duration-500 ${form.isSuper ? 'bg-red-50 shadow-sm ring-1 ring-red-100' : 'bg-white'}`}>
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-500 ${form.isSuper ? 'bg-red-100 text-red-500' : 'bg-slate-100/50 text-slate-400'}`}>
                                <Icons.crown className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <p className={`font-semibold text-sm ${form.isSuper ? 'text-red-700' : 'text-slate-600'}`}>
                                    {L.modal.superAdminLabel}
                                </p>
                                <p className="text-[10px] text-slate-400 mt-0.5">Bypasses all checks</p>
                            </div>
                            <input 
                                type="checkbox" 
                                checked={form.isSuper} 
                                onChange={(e) => setForm({ isSuper: e.target.checked })}
                                className="w-4 h-4 rounded border-slate-300 text-red-500 focus:ring-red-500 transition-all cursor-pointer"
                            />
                        </div>
                    </div>
                </div>

                {/* Permissions Picker Section */}
                <div className="space-y-6 pt-4">
                    <h3 className="text-[10px] font-semibold text-slate-400 uppercase flex items-center gap-2">
                         <Icons.unlock className="w-4 h-4 text-amber-400" /> Fine-grained Permissions
                    </h3>

                    {Object.keys(groupedPermissions).length === 0 ? (
                        <div className="p-8 bg-slate-50 rounded-2xl text-[11px] text-slate-400 text-center border border-dashed border-slate-200">
                            No permissions available to assign.
                        </div>
                    ) : (
                        <div className="bg-slate-50 p-6 rounded-2xl space-y-6">
                            {Object.entries(groupedPermissions).map(([group, perms]) => (
                                <div key={group} className="space-y-3">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{group}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {(perms as Permission[]).map(perm => (
                                            <button
                                                key={perm.id}
                                                type="button"
                                                onClick={() => togglePermission(perm.name)}
                                                className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all duration-200 ${form.selectedPermissions.includes(perm.name)
                                                    ? 'bg-slate-900 text-white shadow-sm'
                                                    : 'bg-white text-slate-500 hover:text-slate-800 hover:shadow-xs'
                                                    }`}
                                            >
                                                {perm.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="pt-6 flex gap-3 sticky bottom-0 bg-transparent">
                    <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={loading}>
                        {L.buttons.cancel}
                    </Button>
                    <Button type="submit" className="flex-1" isLoading={loading}>
                        {role ? L.buttons.save : L.buttons.create}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
