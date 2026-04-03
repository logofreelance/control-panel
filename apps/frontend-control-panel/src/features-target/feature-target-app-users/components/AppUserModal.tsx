'use client';

import { useState, useEffect } from 'react';
import { Button, Input, Select, Modal, Stack, Badge, Text } from '@/components/ui';
import { Icons } from '../config/icons';
import { APP_USER_LABELS } from '../constants/ui-labels';
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

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={user ? L.modal.editTitle : L.modal.addTitle}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <Stack gap={4}>
                    <Input
                        label={L.modal.usernameLabel}
                        placeholder={L.modal.usernamePlaceholder}
                        value={form.username}
                        onChange={(e) => setForm({ ...form, username: e.target.value })}
                        required
                    />

                    <Input
                        label={L.modal.emailLabel}
                        type="email"
                        placeholder={L.modal.emailPlaceholder}
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        required
                    />

                    {!user && (
                        <Input
                            label={L.modal.passwordLabel}
                            type="password"
                            placeholder={L.modal.passwordPlaceholder}
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            required
                        />
                    )}

                    <div>
                        <Text variant="detail" className="mb-1.5">{L.modal.roleLabel}</Text>
                        <Select
                            value={form.role}
                            onChange={(e) => setForm({ ...form, role: e.target.value as AppUserRole })}
                            options={roles.length > 0 ? roles.map(role => ({ label: role.display_name, value: role.name })) : [{ label: 'Searching roles...', value: 'user' }]}
                            fullWidth={true}
                            placeholder={L.modal.rolePlaceholder}
                        />
                    </div>

                    {selectedRole && (
                        <Stack direction="row" gap={2} align="center">
                            <Badge variant="secondary">
                                <Icons.shield className="size-3 mr-1" />
                                {L.modal.level(selectedRole.level)}
                            </Badge>
                            {selectedRole.is_super && (
                                <Badge variant="secondary">
                                    <Icons.crown className="size-3 mr-1" />
                                    {L.modal.privileged}
                                </Badge>
                            )}
                        </Stack>
                    )}
                </Stack>

                <div className="flex gap-3 pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={onClose}
                        disabled={submitting}
                    >
                        {L.modal.cancel}
                    </Button>
                    <Button
                        type="submit"
                        variant="default"
                        className="flex-1"
                        isLoading={submitting}
                    >
                        {user ? L.modal.save : L.modal.create}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
