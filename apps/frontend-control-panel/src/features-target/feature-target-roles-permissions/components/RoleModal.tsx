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
                        <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <Icons.info className="size-4" />
                        </div>
                        <TextHeading size="h6" className="text-base font-semibold lowercase">
                            basic information
                        </TextHeading>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pl-1">
                        <div className="space-y-2">
                            <label className="text-sm text-muted-foreground lowercase px-1 font-medium">{L.modal.nameLabel}</label>
                            <Input
                                className="h-12 rounded-xl lowercase bg-muted/20 border-none focus-visible:ring-1 focus-visible:ring-primary/20"
                                placeholder={L.labels.namePlaceholder}
                                value={form.name}
                                onChange={(e) => setForm({ name: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                                required
                                disabled={!!role}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm text-muted-foreground lowercase px-1 font-medium">{L.modal.displayNameLabel}</label>
                            <Input
                                className="h-12 rounded-xl lowercase bg-muted/20 border-none focus-visible:ring-1 focus-visible:ring-primary/20"
                                placeholder={L.labels.displayNamePlaceholder}
                                value={form.displayName}
                                onChange={(e) => setForm({ displayName: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2 pl-1">
                        <label className="text-sm text-muted-foreground lowercase px-1 font-medium">{L.modal.descriptionLabel}</label>
                        <Input
                            className="h-12 rounded-xl lowercase bg-muted/20 border-none focus-visible:ring-1 focus-visible:ring-primary/20"
                            placeholder={L.labels.descriptionPlaceholder}
                            value={form.description}
                            onChange={(e) => setForm({ description: e.target.value })}
                        />
                    </div>
                </div>

                {/* Security Level Section */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-2 px-1">
                        <div className="size-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                            <Icons.shield className="size-4" />
                        </div>
                        <TextHeading size="h6" className="text-base font-semibold lowercase">
                            access level & security
                        </TextHeading>
                    </div>
                    
                    <div className="bg-muted/30 p-6 rounded-2xl space-y-8 border border-border/5">
                        {/* Level Slider */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-1">
                                <label className="text-sm font-medium text-foreground lowercase">
                                    {L.modal.levelLabel}
                                </label>
                                <Badge variant="secondary" className="px-3 py-1 rounded-lg lowercase font-bold bg-background shadow-sm">
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
                                    className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer accent-primary transition-all hover:h-2"
                                />
                            </div>
                        </div>

                        <div 
                            className={cn(
                                "flex items-center gap-4 p-5 rounded-xl transition-all duration-300 border cursor-pointer",
                                form.isSuper ? 'bg-rose-500/5 border-rose-500/10' : 'bg-background/40 border-transparent hover:bg-background/60'
                            )}
                            onClick={() => setForm({ isSuper: !form.isSuper })}
                        >
                            <div className={cn(
                                "size-10 rounded-xl flex items-center justify-center transition-colors duration-300",
                                form.isSuper ? 'bg-rose-500/20 text-rose-600' : 'bg-muted text-muted-foreground'
                            )}>
                                <Icons.crown className="size-5" />
                            </div>
                            <div className="flex-1">
                                <p className={cn(
                                    "font-semibold text-sm lowercase",
                                    form.isSuper ? 'text-rose-700' : 'text-foreground'
                                )}>
                                    {L.modal.superAdminLabel}
                                </p>
                                <p className="text-xs text-muted-foreground lowercase mt-0.5">
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
                        <div className="size-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                            <Icons.unlock className="size-4" />
                        </div>
                        <TextHeading size="h6" className="text-base font-semibold lowercase">
                            fine-grained permissions
                        </TextHeading>
                    </div>

                    {Object.keys(groupedPermissions).length === 0 ? (
                        <div className="p-10 bg-muted/20 rounded-2xl text-sm text-muted-foreground text-center border border-dashed border-border/20 lowercase">
                            no permissions available to assign.
                        </div>
                    ) : (
                        <div className="bg-muted/30 p-6 rounded-2xl space-y-8 border border-border/5">
                            {Object.entries(groupedPermissions).map(([group, perms]) => (
                                <div key={group} className="space-y-4">
                                    <p className="text-xs font-bold text-muted-foreground/40 uppercase tracking-widest px-1">{group}</p>
                                    <div className="flex flex-wrap gap-2.5">
                                        {(perms as Permission[]).map(perm => (
                                            <Button
                                                key={perm.id}
                                                type="button"
                                                variant={form.selectedPermissions.includes(perm.name) ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => togglePermission(perm.name)}
                                                className={cn(
                                                    "h-9 rounded-xl px-4 lowercase transition-all duration-300 border-none font-medium",
                                                    form.selectedPermissions.includes(perm.name) 
                                                        ? "shadow-sm bg-primary text-primary-foreground" 
                                                        : "bg-background/50 hover:bg-background text-muted-foreground hover:text-foreground"
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
                        className="flex-1 h-12 lowercase rounded-xl hover:bg-muted/50" 
                        onClick={onClose} 
                        disabled={loading}
                    >
                        {L.buttons.cancel}
                    </Button>
                    <Button 
                        type="submit" 
                        className="flex-1 h-12 lowercase rounded-xl shadow-lg shadow-primary/20" 
                        isLoading={loading}
                    >
                        {role ? L.buttons.save : L.buttons.create}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
