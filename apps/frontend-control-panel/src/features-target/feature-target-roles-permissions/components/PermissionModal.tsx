'use client';

import React from 'react';
import { Button, Input, Modal } from '@/components/ui';
import { TextHeading } from '@/components/ui/text-heading';
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
            title={permission ? L.modal.editTitle.toLowerCase() : L.modal.addTitle.toLowerCase()}
        >
            <form onSubmit={onSubmit} className="space-y-8 pt-4 px-1">
                <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-2 px-1">
                        <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <Icons.info className="size-4" />
                        </div>
                        <TextHeading size="h6" className="text-base font-semibold lowercase">
                            permission details
                        </TextHeading>
                    </div>

                    <div className="space-y-6 pl-1">
                        <div className="space-y-2">
                            <label className="text-sm text-muted-foreground lowercase px-1 font-medium">{L.modal.nameLabel}</label>
                            <Input 
                                className="h-12 rounded-xl lowercase bg-muted/20 border-none focus-visible:ring-1 focus-visible:ring-primary/20"
                                placeholder={L.labels.namePlaceholder || 'e.g. create_post'} 
                                value={form.name} 
                                onChange={(e) => setForm({ ...form, name: e.target.value.toLowerCase().replace(/\s+/g, '_') })} 
                                required 
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm text-muted-foreground lowercase px-1 font-medium">{L.modal.groupLabel}</label>
                            <Input 
                                className="h-12 rounded-xl lowercase bg-muted/20 border-none focus-visible:ring-1 focus-visible:ring-primary/20"
                                placeholder={L.labels.groupPlaceholder || 'e.g. content_management'} 
                                value={form.group} 
                                onChange={(e) => setForm({ ...form, group: e.target.value })} 
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm text-muted-foreground lowercase px-1 font-medium">{L.modal.descriptionLabel}</label>
                            <Input 
                                className="h-12 rounded-xl lowercase bg-muted/20 border-none focus-visible:ring-1 focus-visible:ring-primary/20"
                                placeholder={L.labels.descriptionPlaceholder || 'short description...'} 
                                value={form.description} 
                                onChange={(e) => setForm({ ...form, description: e.target.value })} 
                            />
                        </div>
                    </div>
                </div>
                
                <div className="flex gap-4 pt-6">
                    <Button 
                        type="button" 
                        variant="ghost" 
                        className="flex-1 h-12 lowercase rounded-xl hover:bg-muted/50" 
                        onClick={onClose}
                    >
                        {L.buttons.cancel}
                    </Button>
                    <Button 
                        type="submit" 
                        className="flex-1 h-12 lowercase rounded-xl shadow-lg shadow-primary/20"
                    >
                        {permission ? L.buttons.save : L.buttons.create}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
