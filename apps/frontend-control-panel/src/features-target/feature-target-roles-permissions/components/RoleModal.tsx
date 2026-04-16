'use client';

import { Button, Input, Badge, Modal } from '@/components/ui';
import { TextHeading } from '@/components/ui/text-heading';
import { Icons, MODULE_LABELS } from '@/lib/config/client';
import { useRoleModal } from '../composables/useRoleModal';
import { cn } from '@/lib/utils';
import type { Role, Permission } from '../types';

const L = MODULE_LABELS.rolesPermissions.roles;

interface RoleModalProps {
    isOpen: boolean;
    role: Role | null;
    onClose: () => void;
    onSuccess: () => void;
}

export const RoleModal = ({ isOpen, role, onClose, onSuccess }: RoleModalProps) => {
    const {
        loading,
        form,
        setForm,
        groupedPermissions,
        handleSubmit,
        togglePermission,
    } = useRoleModal(isOpen, role, onSuccess);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={role ? L.modal.editTitle.toLowerCase() : L.modal.addTitle.toLowerCase()}
        >
            <form onSubmit={handleSubmit} className="space-y-10 pt-4 px-1">
                {/* Basic Info Section */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-2 px-1">
                        <div className="size-10 rounded-xl bg-muted flex items-center justify-center text-primary">
                            <Icons.info className="size-5" />
                        </div>
                        <TextHeading size="h4" className="lowercase">
                            basic information
                        </TextHeading>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pl-1">
                        <div className="space-y-2">
                            <label className="text-base font-normal text-muted-foreground lowercase px-1">{L.modal.nameLabel}</label>
                            <Input
                                placeholder={L.labels.namePlaceholder}
                                value={form.name}
                                onChange={(e) => setForm({ name: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                                required
                                disabled={!!role}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-base font-normal text-muted-foreground lowercase px-1">{L.modal.displayNameLabel}</label>
                            <Input
                                placeholder={L.labels.displayNamePlaceholder}
                                value={form.displayName}
                                onChange={(e) => setForm({ displayName: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2 pl-1">
                        <label className="text-base font-normal text-muted-foreground lowercase px-1">{L.modal.descriptionLabel}</label>
                        <Input
                            placeholder={L.labels.descriptionPlaceholder}
                            value={form.description}
                            onChange={(e) => setForm({ description: e.target.value })}
                        />
                    </div>
                </div>

                {/* Security Level Section */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-2 px-1">
                        <div className="size-10 rounded-xl bg-muted flex items-center justify-center text-emerald-600">
                            <Icons.shield className="size-5" />
                        </div>
                        <TextHeading size="h4" className="lowercase">
                            access level & security
                        </TextHeading>
                    </div>
                    
                    <div className="bg-muted p-6 rounded-2xl space-y-8 border border-border">
                        {/* Level Slider */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-1">
                                <label className="text-base font-normal text-foreground lowercase">
                                    {L.modal.levelLabel}
                                </label>
                                <Badge variant="secondary" className="px-3 py-1 rounded-lg lowercase font-normal bg-background">
                                    {form.level}
                                </Badge>
                            </div>
                            <div className="px-1">
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={form.level}
                                    onChange={(e) => setForm({ level: parseInt(e.target.value) })}
                                    className="w-full h-1.5 bg-background rounded-full appearance-none cursor-pointer accent-primary transition-all hover:h-2"
                                />
                            </div>
                        </div>

                        <div 
                            className={cn(
                                "flex items-center gap-4 p-5 rounded-xl transition-all duration-300 border cursor-pointer",
                                form.isSuper ? 'bg-background border-rose-500' : 'bg-background border-transparent hover:bg-muted/80'
                            )}
                            onClick={() => setForm({ isSuper: !form.isSuper })}
                        >
                            <div className={cn(
                                "size-10 rounded-xl flex items-center justify-center transition-colors duration-300",
                                form.isSuper ? 'bg-muted text-rose-600' : 'bg-muted border border-border text-muted-foreground'
                            )}>
                                <Icons.crown className="size-5" />
                            </div>
                            <div className="flex-1">
                                <p className={cn(
                                    "font-normal text-base lowercase",
                                    form.isSuper ? 'text-rose-700' : 'text-foreground'
                                )}>
                                    {L.modal.superAdminLabel}
                                </p>
                                <p className="text-base font-normal text-muted-foreground lowercase mt-0.5">
                                    bypasses all security checks
                                </p>
                            </div>
                            <div className={cn(
                                "size-5 rounded-md border flex items-center justify-center transition-all",
                                form.isSuper ? 'bg-rose-500 border-rose-500 text-white' : 'border-muted-foreground/30'
                            )}>
                                {form.isSuper && <Icons.check className="size-3.5 stroke-3" />}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Permissions Picker Section */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-2 px-1">
                        <div className="size-10 rounded-xl bg-muted flex items-center justify-center text-amber-600">
                            <Icons.unlock className="size-5" />
                        </div>
                        <TextHeading size="h4" className="lowercase">
                            fine-grained permissions
                        </TextHeading>
                    </div>

                    {Object.keys(groupedPermissions).length === 0 ? (
                        <div className="p-10 bg-muted rounded-2xl text-base text-muted-foreground text-center border border-dashed border-border lowercase">
                            no permissions available to assign.
                        </div>
                    ) : (
                        <div className="bg-muted p-6 rounded-2xl space-y-8 border border-border">
                            {Object.entries(groupedPermissions).map(([group, perms]) => (
                                <div key={group} className="space-y-4">
                                    <p className="text-base font-normal text-muted-foreground uppercase px-1">{group}</p>
                                    <div className="flex flex-wrap gap-2.5">
                                        {(perms as Permission[]).map(perm => (
                                            <Button
                                                key={perm.id}
                                                type="button"
                                                variant={form.selectedPermissions.includes(perm.name) ? 'default' : 'outline'}
                                                onClick={() => togglePermission(perm.name)}
                                                className={cn(
                                                    "rounded-xl px-4 lowercase transition-all",
                                                    form.selectedPermissions.includes(perm.name) 
                                                        ? "" 
                                                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                                                )}
                                            >
                                                {perm.name}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="pt-8 flex gap-4">
                    <Button 
                        type="button" 
                        variant="ghost" 
                        className="flex-1 lowercase" 
                        onClick={onClose} 
                        disabled={loading}
                    >
                        {L.buttons.cancel}
                    </Button>
                    <Button 
                        type="submit" 
                        className="flex-1 lowercase" 
                        isLoading={loading}
                    >
                        {role ? L.buttons.save : L.buttons.create}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
