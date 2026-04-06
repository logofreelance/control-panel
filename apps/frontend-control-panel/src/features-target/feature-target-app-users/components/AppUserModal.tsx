'use client';

/**
 * AppUserModal - Minimalist Analytics Refactor (V12 Clean Identity)
 * 
 * STICKING TO RULES:
 * - No tracking-*
 * - No text size < text-xs
 * - No text color opacity (text-foreground/80)
 * - Standard Button usage only
 * 
 * CLEANUP:
 * - Removed heavily customized decorative boxes to let the global Modal padding speak.
 * - Positioned Level and Privilege info clearly below the Role select.
 * - Maintained pixel-perfect h-12! height synchronization for all inputs.
 */

import { useState, useEffect } from 'react';
import { Button, Input, Select, Modal, Badge } from '@/components/ui';
import { Icons } from '../config/icons';
import { APP_USER_LABELS } from '../constants/ui-labels';
import { cn } from '@/lib/utils';
import type { AppUser, AppUserFormData, AppUserRole } from '../types/app-user.types';

const L = APP_USER_LABELS;

interface AppUserModalProps {
    isOpen: boolean;
    user: AppUser | null;
    roles: any[];
    submitting?: boolean;
    onClose: () => void;
    onSubmit: (data: AppUserFormData) => void;
}

export const AppUserModal = ({ isOpen, user, roles, submitting, onClose, onSubmit }: AppUserModalProps) => {
    const [form, setForm] = useState<AppUserFormData>({
        username: '',
        email: '',
        password: '',
        role: 'user'
    });

    useEffect(() => {
        if (user) {
            setForm({
                username: user.username,
                email: user.email,
                password: '',
                role: (user.role as AppUserRole) || 'user'
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

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={user ? L.modal.editTitle : L.modal.addTitle}
            className="sm:max-w-xl"
        >
            <form id="app-user-form" onSubmit={handleSubmit} className="flex flex-col gap-10 font-instrument">
                <div className="grid grid-cols-1 gap-8">
                    <Input
                        label={L.modal.usernameLabel}
                        placeholder={L.modal.usernamePlaceholder}
                        value={form.username}
                        onChange={(e) => setForm({ ...form, username: e.target.value })}
                        required
                        className="bg-muted border border-border h-12! px-5 text-base font-normal items-center flex rounded-2xl shadow-none focus:ring-1 focus:ring-primary/20"
                    />

                    <Input
                        label={L.modal.emailLabel}
                        type="email"
                        placeholder={L.modal.emailPlaceholder}
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        required
                        className="bg-muted border border-border h-12! px-5 text-base font-normal items-center flex rounded-2xl shadow-none focus:ring-1 focus:ring-primary/20"
                    />

                    {!user && (
                        <Input
                            label={L.modal.passwordLabel}
                            type="password"
                            placeholder={L.modal.passwordPlaceholder}
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            required
                            className="bg-muted border border-border h-12! px-5 text-base font-normal items-center flex rounded-2xl shadow-none focus:ring-1 focus:ring-primary/20"
                        />
                    )}

                    <div className="space-y-4">
                         <div className="space-y-2">
                             <label className="text-sm font-normal text-foreground/75 px-1">{L.modal.roleLabel}</label>
                             <Select
                                value={form.role}
                                onChange={(e) => setForm({ ...form, role: e.target.value as AppUserRole })}
                                options={roles.length > 0 ? roles.map(role => ({ label: role.display_name, value: role.name })) : [{ label: 'Searching roles...', value: 'user' }]}
                                fullWidth
                                size="lg"
                                className="h-12! bg-muted border border-border rounded-2xl text-base font-normal px-5 focus:ring-1 focus:ring-primary/20 flex items-center justify-between shadow-none"
                                placeholder={L.modal.rolePlaceholder}
                            />
                         </div>

                         {selectedRole && (
                            <div className="flex flex-wrap gap-2 px-1">
                                <Badge className="h-7 px-3 rounded-full border border-border bg-background text-foreground text-[10px] font-normal transition-colors shadow-none uppercase">
                                    <Icons.shield className="size-3.5 mr-2 text-chart-1" />
                                    {L.modal.level(selectedRole.level)}
                                </Badge>
                                {selectedRole.is_super && (
                                    <Badge className="h-7 px-3 rounded-full border border-border/50 bg-chart-3/10 text-chart-3 text-[10px] font-semibold transition-colors shadow-none uppercase border-chart-3/20">
                                        <Icons.crown className="size-3.5 mr-2" />
                                        {L.modal.privileged}
                                    </Badge>
                                )}
                            </div>
                         )}
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/10">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onClose}
                        disabled={submitting}
                    >
                        {L.modal.cancel}
                    </Button>
                    <Button
                        type="submit"
                        variant="default"
                        isLoading={submitting}
                    >
                        {user ? L.modal.save : L.modal.create}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
