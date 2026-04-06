'use client';

/**
 * AppUserManagementView - Flat Luxury UI Refactor (Analytics Style)
 * Following the style of MonitorAnalyticsView.tsx
 * STICKING TO RULES: NO TRACKING | MIN FONT XS | NO TEXT OPACITY
 * 
 * UPDATE: Removed forced 'lowercase' transformation from all labels and buttons 
 * to avoid 'overdoing' lowercase while keeping a premium minimalist feel.
 */

import { useState } from 'react';
import { Button, Card, CardContent, Skeleton } from '@/components/ui';
import { Icons } from '../config/icons';
import { APP_USER_LABELS } from '../constants/ui-labels';
import { ConfirmDialog } from '@/modules/_core';
import { useAppUsers } from '../composables/useAppUsers';
import { AppUserFilter } from './AppUserFilter';
import { AppUserTable } from './AppUserTable';
import { AppUserPagination } from './AppUserPagination';
import { AppUserModal } from './AppUserModal';
import type { AppUser, AppUserFormData } from '../types/app-user.types';
import { TargetLayout } from '@/components/layout/TargetLayout';
import { TextHeading } from '@/components/ui/text-heading';
import { cn } from '@/lib/utils';
import { useToast } from '@/modules/_core';

const L = APP_USER_LABELS;

export const AppUserManagementView = () => {
    const { addToast } = useToast();
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
            addToast('User saved successfully', 'success');
        }
    };

    const handleDelete = async () => {
        if (!confirmDialog) return;
        const success = await deleteUser(confirmDialog.id);
        if (success) {
            setConfirmDialog(null);
            addToast('User deleted successfully', 'success');
        }
    };

    const metrics = [
        {
            id: 'total',
            label: L.filter.totalUsers,
            value: totalUsers,
            icon: Icons.users,
            color: 'text-chart-1',
            ring: 'ring-chart-1/20 hover:ring-chart-1',
            bg: 'bg-chart-1',
        },
        {
            id: 'active',
            label: L.filter.active,
            value: users.filter(u => u.isActive).length,
            icon: Icons.activity,
            color: 'text-chart-2',
            ring: 'ring-chart-2/20 hover:ring-chart-2',
            bg: 'bg-chart-2',
        },
        {
            id: 'roles',
            label: 'System Roles',
            value: roles.length,
            icon: Icons.shield,
            color: 'text-chart-3',
            ring: 'ring-chart-3/20 hover:ring-chart-3',
            bg: 'bg-chart-3',
        },
        {
            id: 'recent',
            label: 'Recently Active',
            value: `+${users.filter(u => {
                if (!u.updatedAt) return false;
                const updatedDate = new Date(u.updatedAt).getTime();
                const sevenDaysAgo = new Date().getTime() - (7 * 24 * 60 * 60 * 1000);
                return updatedDate > sevenDaysAgo;
            }).length}`,
            icon: Icons.clock,
            color: 'text-chart-4',
            ring: 'ring-chart-4/20 hover:ring-chart-4',
            bg: 'bg-chart-4',
        },
    ];


    return (
        <TargetLayout>
            <div className="relative w-full min-h-screen bg-background font-instrument overflow-x-hidden pb-10 sm:pb-20">
                <main className="relative z-10 w-full max-w-7xl mx-auto py-6 md:py-10 px-4 md:px-10 flex flex-col gap-10 md:gap-14 animate-spring">
                    {/* PAGE HEADER */}
                    <header className="flex items-center justify-between gap-4">
                        <div className="flex flex-col gap-1">
                            <TextHeading as="h1" size="h3">
                                {L.view.title}
                            </TextHeading>
                            <span className="text-sm md:text-lg text-muted-foreground font-normal">
                                {L.view.subtitle}
                            </span>
                        </div>

                        <div className="flex items-center gap-3">
                            <Button
                                variant="default"
                                size="icon"
                                onClick={openCreate}
                            >
                                <Icons.plus className="size-5" />
                            </Button>
                        </div>
                    </header>

                    {/* METRICS GRID - Analytics Style */}
                    <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        {metrics.map((m) => (
                            <Card
                                key={m.id}
                                className={cn(
                                    'group relative bg-card overflow-hidden transition-all duration-300 border-none',
                                    'ring-1',
                                    m.ring
                                )}
                            >
                                {/* SILHOUETTE */}
                                <div className={cn(
                                    'absolute -right-6 -bottom-6 size-24 sm:size-32 transition-transform group-hover:scale-110 opacity-5 blur-2xl',
                                    m.color
                                )}>
                                    <m.icon className="size-full rotate-12" />
                                </div>

                                <CardContent className="relative px-4 py-3 sm:px-5 sm:py-4 flex flex-col gap-3 sm:gap-4">
                                    <div className="flex justify-between items-start">
                                        <span className="text-sm md:text-base font-normal text-muted-foreground leading-none">
                                            {m.label}
                                        </span>
                                        <div className={cn(
                                            'size-8 sm:size-10 rounded-xl flex items-center justify-center transition-transform group-hover:-rotate-6 bg-background border border-border/5',
                                            m.color
                                        )}>
                                            <m.icon className="size-4 sm:size-5" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <TextHeading
                                            as="p"
                                            size="h1"
                                            className="text-4xl sm:text-5xl font-medium leading-none text-foreground"
                                        >
                                            {loading ? <Skeleton className="h-10 w-20" /> : m.value}
                                        </TextHeading>
                                        <div className="flex items-center gap-2">
                                            <div className={cn('size-1.5 rounded-full', m.bg)} />
                                            <span className="text-xs md:text-sm font-normal text-muted-foreground">
                                                Live Status ({totalUsers} users)
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </section>

                    {/* FILTERS & LISTING */}
                    <div className="flex flex-col gap-8">
                         <AppUserFilter
                            filter={filter}
                            pagination={pagination}
                            totalUsers={totalUsers}
                            roles={roles}
                            onFilterChange={updateFilter}
                            onLimitChange={setLimit}
                            onReset={resetFilter}
                        />

                        <main className="relative overflow-hidden">
                            <AppUserTable
                                users={users}
                                loading={loading}
                                onEdit={openEdit}
                                onDelete={(user: AppUser) => setConfirmDialog(user)}
                            />
                        </main>

                        <footer>
                            <AppUserPagination
                                pagination={pagination}
                                limit={pagination.limit}
                                onPageChange={goToPage}
                            />
                        </footer>
                    </div>
                </main>

                {/* MODALS */}
                <AppUserModal
                    isOpen={showModal}
                    user={editingUser}
                    roles={roles}
                    submitting={submitting}
                    onClose={() => setShowModal(false)}
                    onSubmit={handleSubmit}
                />

                <ConfirmDialog
                    isOpen={!!confirmDialog}
                    onClose={() => setConfirmDialog(null)}
                    onConfirm={handleDelete}
                    title="Delete App User?"
                    message={`${L.confirm.deleteMessage} "${confirmDialog?.username}"`}
                    confirmText={L.confirm.deleteConfirm}
                    variant="danger"
                    loading={submitting}
                />
            </div>
        </TargetLayout>
    );
};
