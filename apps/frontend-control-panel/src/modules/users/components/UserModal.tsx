'use client';

/**
 * UserModal - Modal for creating/editing users
 * Refactored to match Dashboard design standards (Flat UI)
 */

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button, Input, Select } from '@/components/ui';
import { Icons, MODULE_LABELS } from '@/lib/config/client';
import type { User, UserFormData, UserRole, RoleInfo } from '../types';

const L = MODULE_LABELS.users;

interface UserModalProps {
    isOpen: boolean;
    user: User | null;
    roles: RoleInfo[];
    submitting?: boolean;
    onClose: () => void;
    onSubmit: (data: UserFormData) => void;
}

export const UserModal = ({ isOpen, user, roles, submitting, onClose, onSubmit }: UserModalProps) => {
    const [form, setForm] = useState<UserFormData>({
        username: '',
        email: '',
        password: '',
        role: 'user'
    });

    // Reset form when modal opens/closes or user changes
    useEffect(() => {
        if (user) {
            setForm({
                username: user.username,
                email: user.email,
                password: '',
                role: user.role || 'user'
            });
        } else {
            setForm({ username: '', email: '', password: '', role: 'user' });
        }
    }, [user, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(form);
    };

    if (!isOpen) return null;

    const selectedRole = roles.find(r => r.name === form.role);

    const modalContent = (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={() => !submitting && onClose()} />
            <div className="relative bg-white w-full max-w-md rounded-2xl p-6 shadow-xl animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                            <Icons.user className="w-5 h-5 text-blue-600" />
                        </div>
                        <h2 className="text-lg font-semibold text-slate-900">{user ? L.modal.editTitle : L.modal.addTitle}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={submitting}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                        <Icons.close className="w-4 h-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1.5">{L.modal.usernameLabel}</label>
                        <Input
                            placeholder={L.modal.usernamePlaceholder}
                            value={form.username}
                            onChange={(e) => setForm({ ...form, username: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1.5">{L.modal.emailLabel}</label>
                        <Input
                            type="email"
                            placeholder={L.modal.emailPlaceholder}
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            required
                        />
                    </div>

                    {!user && (
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1.5">{L.modal.passwordLabel}</label>
                            <Input
                                type="password"
                                placeholder={L.modal.passwordPlaceholder}
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                required
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1.5">{L.modal.roleLabel}</label>
                        <Select
                            value={form.role}
                            onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
                            options={roles.map(role => ({ label: role.display_name, value: role.name }))}
                            fullWidth={true}
                        />
                        {/* Role info badge */}
                        {selectedRole && (
                            <div className="mt-2">
                                <span className="px-2 py-1 bg-slate-50 text-slate-500 rounded-lg text-[10px] font-medium">
                                    {L.labels.level}: {selectedRole.level}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="ghost"
                            className="flex-1"
                            onClick={onClose}
                            disabled={submitting}
                        >
                            {L.buttons.cancel}
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1"
                            isLoading={submitting}
                        >
                            {user ? L.buttons.save : L.buttons.create}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );

    // Use portal to render at document body level
    if (typeof document !== 'undefined') {
        return createPortal(modalContent, document.body);
    }

    return modalContent;
};
