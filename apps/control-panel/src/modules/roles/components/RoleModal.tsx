'use client';

/**
 * RoleModal - Create/Edit role with permissions picker
 * PURE DI: Uses @cp/config labels and Icons
 */

import { Button, Input } from '@cp/ui';
import { Icons, MODULE_LABELS } from '@cp/config/client';
import { useRoleModal } from '../composables';
import type { Role, Permission } from '../types';

const L = MODULE_LABELS.roles;

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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                <h2 className="text-2xl font-bold mb-6">
                    {role ? L.modal.editTitle : L.modal.addTitle}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                    {/* Level Slider */}
                    <div>
                        <label className="block text-sm font-bold text-slate-600 mb-2">
                            {L.modal.levelLabel}: {form.level}
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={form.level}
                            onChange={(e) => setForm({ level: parseInt(e.target.value) })}
                            className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[var(--primary)]"
                        />
                    </div>

                    {/* Super Admin Toggle */}
                    <div className="flex items-center gap-3 p-4 bg-red-50 rounded-2xl border border-red-100">
                        <input
                            type="checkbox"
                            id="isSuper"
                            checked={form.isSuper}
                            onChange={(e) => setForm({ isSuper: e.target.checked })}
                            className="w-5 h-5 rounded accent-red-500"
                        />
                        <label htmlFor="isSuper" className="flex-1">
                            <span className="font-bold text-red-700">{L.modal.superAdminLabel}</span>
                        </label>
                        <Icons.crown className="w-6 h-6 text-amber-500" />
                    </div>

                    {/* Permissions Picker */}
                    <div>
                        <label className="block text-sm font-bold text-slate-600 mb-3">
                            {L.labels.permissions} ({form.selectedPermissions.length})
                        </label>

                        {Object.keys(groupedPermissions).length === 0 ? (
                            <div className="p-4 bg-slate-50 rounded-2xl text-sm text-slate-400 text-center">
                                {L.messages.empty}
                            </div>
                        ) : (
                            <div className="space-y-4 max-h-48 overflow-y-auto p-4 bg-slate-50 rounded-2xl">
                                {Object.entries(groupedPermissions).map(([group, perms]) => (
                                    <div key={group}>
                                        <p className="text-xs font-bold text-slate-400 mb-2 uppercase">{group}</p>
                                        <div className="flex flex-wrap gap-2">
                                            {(perms as Permission[]).map(perm => (
                                                <button
                                                    key={perm.id}
                                                    type="button"
                                                    onClick={() => togglePermission(perm.name)}
                                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${form.selectedPermissions.includes(perm.name)
                                                        ? 'bg-[var(--primary)] text-white'
                                                        : 'bg-white text-slate-600 hover:bg-slate-100'
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

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <Button type="button" variant="slate" className="flex-1" onClick={onClose} disabled={loading}>
                            {L.buttons.cancel}
                        </Button>
                        <Button type="submit" className="flex-1" isLoading={loading}>
                            {role ? L.buttons.save : L.buttons.create}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

