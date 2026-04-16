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
      color: 'text-primary',
      bg: 'bg-primary',
    },
    {
      id: 'active',
      label: L.filter.active,
      value: users.filter((u) => u.isActive).length,
      icon: Icons.activity,
      color: 'text-foreground',
      bg: 'bg-primary',
    },
    {
      id: 'roles',
      label: 'System Roles',
      value: roles.length,
      icon: Icons.shield,
      color: 'text-foreground',
      bg: 'bg-secondary',
    },
    {
      id: 'recent',
      label: 'Recently Active',
      value: `+${
        users.filter((u) => {
          if (!u.updatedAt) return false;
          const updatedDate = new Date(u.updatedAt).getTime();
          const sevenDaysAgo = new Date().getTime() - 7 * 24 * 60 * 60 * 1000;
          return updatedDate > sevenDaysAgo;
        }).length
      }`,
      icon: Icons.clock,
      color: 'text-muted-foreground',
      bg: 'bg-muted',
    },
  ];

  return (
    <TargetLayout>
      <div className="relative w-full min-h-screen bg-background font-instrument overflow-x-hidden pb-6">
        <main className="relative z-10 w-full max-w-7xl mx-auto py-4 md:py-6 px-4 md:px-6 flex flex-col gap-4 animate-spring">
          {/* PAGE HEADER */}
          <header className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
            <TextHeading as="h1" size="h3">
                {L.view.title}
              </TextHeading>
              <span className="text-base text-muted-foreground font-normal">
                {L.view.subtitle}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="default" size="icon" onClick={openCreate}>
                <Icons.plus className="size-5" />
              </Button>
            </div>
          </header>

          {/* METRICS GRID - Analytics Style */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((m) => (
              <Card
                key={m.id}
                className="group relative bg-card overflow-hidden transition-all duration-300"
              >
                <CardContent className="relative p-5 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <span className="text-base font-normal text-muted-foreground leading-none">
                      {m.label}
                    </span>
                    <div
                      className={cn(
                        'size-10 rounded-xl flex items-center justify-center bg-muted',
                        m.color,
                      )}
                    >
                      <m.icon className="size-5" />
                    </div>
                  </div>
                    <div className="flex flex-col gap-0.5">
                      <TextHeading
                        size="h3"
                        className="text-foreground"
                      >
                        {loading ? <Skeleton className="h-8 w-20" /> : m.value}
                      </TextHeading>
                      <div className="flex items-center gap-2">
                        <div className={cn('size-1.5 rounded-full', m.bg)} />
                        <span className="text-base font-normal text-muted-foreground">
                          Live Status
                        </span>
                      </div>
                    </div>
                </CardContent>
              </Card>
            ))}
          </section>

          {/* FILTERS & LISTING */}
          <div className="flex flex-col gap-4">
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
