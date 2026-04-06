'use client';

/**
 * UsersView - Main users management view
 * Updated to match Dashboard design standards
 */

import { useState } from 'react';
import { Button } from '@/components/ui';
import { Icons, MODULE_LABELS } from '@/lib/config/client';
import { ConfirmDialog } from '@/modules/_core';
import { useUsers } from '../composables';
import { UsersFilter } from './UsersFilter';
import { UsersTable } from './UsersTable';
import { UsersPagination } from './UsersPagination';
import { UserModal } from './UserModal';
import type { User, UserFormData } from '../types';

const L = MODULE_LABELS.users;

export const UsersView = () => {
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
        totalPages,
        goToPage,
        setLimit,
        createUser,
        updateUser,
        deleteUser,
    } = useUsers();

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [confirmDialog, setConfirmDialog] = useState<User | null>(null);

    const openCreate = () => {
        setEditingUser(null);
        setShowModal(true);
    };

    const openEdit = (user: User) => {
        setEditingUser(user);
        setShowModal(true);
    };

    const handleSubmit = async (formData: UserFormData) => {
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

    const LoadingOverlay = () => (
        <div className="absolute inset-0 bg-white z-10 flex items-center justify-center rounded-xl">
            <div className="w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin shadow-sm" />
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                        <Icons.users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-semibold text-slate-800">{L.title}</h1>
                        <p className="text-sm text-slate-500">{L.subtitle}</p>
                    </div>
                </div>
                <Button onClick={openCreate} size="sm" className="gap-2">
                    <Icons.plus className="w-4 h-4" /> {L.buttons.addUser}
                </Button>
            </div>

            {/* Filter bar */}
            <div className="relative min-h-[80px]">
                {loading && <LoadingOverlay />}
                <UsersFilter
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
                {loading && <LoadingOverlay />}
                <UsersTable
                    users={users}
                    loading={false} // Disable internal skeleton to use overlay
                    onEdit={openEdit}
                    onDelete={(user) => setConfirmDialog(user)}
                />
            </div>

            {/* Pagination */}
            <UsersPagination
                currentPage={pagination.page}
                totalPages={totalPages}
                totalItems={totalUsers}
                limit={pagination.limit}
                onPageChange={goToPage}
            />

            {/* User Modal */}
            <UserModal
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
                title={L.buttons.delete}
                message={L.messages.confirmDelete}
                confirmText={L.buttons.delete}
                variant="danger"
                loading={submitting}
            />
        </div>
    );
};
