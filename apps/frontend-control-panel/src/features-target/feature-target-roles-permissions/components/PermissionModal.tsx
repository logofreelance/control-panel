'use client';

import React from 'react';
import { Button, Input, Modal } from '@/components/ui';
import { Icons, MODULE_LABELS } from '@/lib/config/client';
import type { Permission, PermissionForm } from '../types';

const L = MODULE_LABELS.rolesPermissions.permissions;

interface PermissionModalProps {
    isOpen: boolean;
    onClose: () => void;
    permission: Permission | null;
    form: PermissionForm;
    setForm: (form: PermissionForm) => void;
    onSubmit: (e: React.FormEvent) => void;
}

export const PermissionModal = ({
    isOpen,
    onClose,
    permission,
    form,
    setForm,
    onSubmit
}: PermissionModalProps) => {
    if (!isOpen) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={permission ? L.modal.editTitle : L.modal.addTitle}
        >
            <form onSubmit={onSubmit} className="space-y-6">
                <div className="space-y-4">
                    <Input 
                        label={L.modal.nameLabel} 
                        placeholder={L.labels.namePlaceholder || 'e.g. create_post'} 
                        value={form.name} 
                        onChange={(e) => setForm({ ...form, name: e.target.value })} 
                        required 
                    />
                    <Input 
                        label={L.modal.groupLabel} 
                        placeholder={L.labels.groupPlaceholder || 'e.g. content_management'} 
                        value={form.group} 
                        onChange={(e) => setForm({ ...form, group: e.target.value })} 
                    />
                    <Input 
                        label={L.modal.descriptionLabel} 
                        placeholder={L.labels.descriptionPlaceholder || 'Short description...'} 
                        value={form.description} 
                        onChange={(e) => setForm({ ...form, description: e.target.value })} 
                    />
                </div>
                
                <div className="flex gap-3 pt-4">
                    <Button 
                        type="button" 
                        variant="outline" 
                        className="flex-1" 
                        onClick={onClose}
                    >
                        {L.buttons.cancel}
                    </Button>
                    <Button 
                        type="submit" 
                        className="flex-1"
                    >
                        {permission ? L.buttons.save : L.buttons.create}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
