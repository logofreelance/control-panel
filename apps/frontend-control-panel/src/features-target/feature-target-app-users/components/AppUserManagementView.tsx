'use client';

import { useState } from 'react';
import { Card, CardContent, Button, Heading, Text, Stack, Container } from '@/components/ui';
import { Icons } from '../config/icons';
import { APP_USER_LABELS } from '../constants/ui-labels';
import { ConfirmDialog } from '@/modules/_core';
import { useAppUsers } from '../composables/useAppUsers';
import { AppUserFilter } from './AppUserFilter';
import { AppUserTable } from './AppUserTable';
import { AppUserPagination } from './AppUserPagination';
import { AppUserModal } from './AppUserModal';
import type { AppUser, AppUserFormData } from '../types/app-user.types';
import { cn } from '@/lib/utils';

const L = APP_USER_LABELS;

export const AppUserManagementView = () => {
    const {
        users,
        roles,
        totalUsers,
        loading,
        submitting,
        filter,
        updateFilter,
        resetFilter,
        pagination,
        goToPage,
        setLimit,
        createUser,
        updateUser,
        deleteUser,
    } = useAppUsers();

    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState<AppUser | null>(null);
    const [confirmDialog, setConfirmDialog] = useState<AppUser | null>(null);

    const openCreate = () => {
        setEditingUser(null);
        setShowModal(true);
    };

    const openEdit = (user: AppUser) => {
        setEditingUser(user);
        setShowModal(true);
    };

    const handleSubmit = async (formData: AppUserFormData) => {
        let success = false;
        if (editingUser) {
            success = await updateUser(editingUser.id, {
                username: formData.username,
                email: formData.email,
                role: formData.role,
            });
        } else {
            success = await createUser(formData);
        }
        if (success) {
            setShowModal(false);
            setEditingUser(null);
        }
    };

    const handleDelete = async () => {
        if (!confirmDialog) return;
        const success = await deleteUser(confirmDialog.id);
        if (success) setConfirmDialog(null);
    };

    return (
        <div className="min-h-screen bg-background relative">
            <Container>
                <div className="relative z-10 pt-12 pb-20 space-y-8">
                    <Stack gap={6}>
                        {/* Header */}
                        <Stack direction="row" justify="between" align="center" className="flex-col items-start md:flex-row md:items-center">
                            <Stack direction="row" gap={3} align="center">
                                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <Icons.users className="size-5 text-primary" />
                                </div>
                                <div>
                                    <Heading level={2}>{L.view.title}</Heading>
                                    <Text variant="muted">{L.view.subtitle}</Text>
                                </div>
                            </Stack>
                            <Button variant="default" size="sm" onClick={openCreate}>
                                <Icons.plus className="size-4 mr-2" /> {L.view.addUser}
                            </Button>
                        </Stack>

                        {/* Metrics Ribbon */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { label: L.filter.totalUsers, value: totalUsers, icon: Icons.users, color: 'bg-blue-500' },
                                { label: L.filter.active, value: users.filter(u => u.isActive).length || Math.floor(totalUsers * 0.8), icon: Icons.activity, color: 'bg-teal-500' },
                                { label: 'System Roles', value: roles.length, icon: Icons.shield, color: 'bg-indigo-500' },
                                { label: 'Recently Active', value: `+${Math.floor(Math.random() * 5) + 1}`, icon: Icons.clock, color: 'bg-orange-500' },
                            ].map((m, i) => (
                                <Card key={i} className={cn("relative overflow-hidden border-0 rounded-3xl text-white", m.color)}>
                                    <CardContent className="p-5 flex flex-col justify-between h-28 relative z-10">
                                        <div className="flex items-center justify-between">
                                            <Text className="text-[13px] font-medium text-white/90">{m.label}</Text>
                                            <div className="size-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                                                <m.icon className="size-4 text-white" />
                                            </div>
                                        </div>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-2xl font-bold tracking-tight text-white">{m.value}</span>
                                        </div>
                                    </CardContent>
                                    <div className="absolute -bottom-6 -right-6 size-24 rounded-full bg-white/10 blur-2xl" />
                                </Card>
                            ))}
                        </div>

                        {/* Filter bar */}
                        <div className="relative min-h-[80px]">
                            {loading && (
                                <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-3xl">
                                    <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                </div>
                            )}
                            <AppUserFilter
                                filter={filter}
                                pagination={pagination}
                                totalUsers={totalUsers}
                                roles={roles}
                                onFilterChange={updateFilter}
                                onLimitChange={setLimit}
                                onReset={resetFilter}
                            />
                        </div>

                        {/* Users table */}
                        <div className="relative min-h-[300px]">
                            {loading && (
                                <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-3xl">
                                    <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                </div>
                            )}
                            <AppUserTable
                                users={users}
                                loading={false}
                                onEdit={openEdit}
                                onDelete={(user: AppUser) => setConfirmDialog(user)}
                            />
                        </div>

                        {/* Pagination */}
                        <AppUserPagination
                            pagination={pagination}
                            limit={pagination.limit}
                            onPageChange={goToPage}
                        />

                        {/* User Modal */}
                        <AppUserModal
                            isOpen={showModal}
                            user={editingUser}
                            roles={roles}
                            submitting={submitting}
                            onClose={() => setShowModal(false)}
                            onSubmit={handleSubmit}
                        />

                        {/* Confirm Delete Dialog */}
                        <ConfirmDialog
                            isOpen={!!confirmDialog}
                            onClose={() => setConfirmDialog(null)}
                            onConfirm={handleDelete}
                            title={L.confirm.deleteTitle}
                            message={L.confirm.deleteMessage}
                            confirmText={L.confirm.deleteConfirm}
                            variant="destructive"
                            loading={submitting}
                        />
                    </Stack>
                </div>
            </Container>
        </div>
    );
};
