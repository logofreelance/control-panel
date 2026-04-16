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
                        <div className="size-10 rounded-xl bg-muted flex items-center justify-center text-primary">
                            <Icons.info className="size-5" />
                        </div>
                        <TextHeading size="h4" className="lowercase">
                            permission details
                        </TextHeading>
                    </div>

                    <div className="space-y-6 pl-1">
                        <div className="space-y-2">
                            <label className="text-base font-normal text-muted-foreground lowercase px-1">{L.modal.nameLabel}</label>
                            <Input 
                                placeholder={L.labels.namePlaceholder || 'e.g. create_post'} 
                                value={form.name} 
                                onChange={(e) => setForm({ ...form, name: e.target.value.toLowerCase().replace(/\s+/g, '_') })} 
                                required 
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-base font-normal text-muted-foreground lowercase px-1">{L.modal.groupLabel}</label>
                            <Input 
                                placeholder={L.labels.groupPlaceholder || 'e.g. content_management'} 
                                value={form.group} 
                                onChange={(e) => setForm({ ...form, group: e.target.value })} 
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-base font-normal text-muted-foreground lowercase px-1">{L.modal.descriptionLabel}</label>
                            <Input 
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
                        className="flex-1 lowercase" 
                        onClick={onClose}
                    >
                        {L.buttons.cancel}
                    </Button>
                    <Button 
                        type="submit" 
                        className="flex-1 lowercase"
                    >
                        {permission ? L.buttons.save : L.buttons.create}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
