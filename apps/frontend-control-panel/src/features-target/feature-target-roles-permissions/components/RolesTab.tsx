'use client';

import { Button, Badge, Card, CardContent } from '@/components/ui';
import { TextHeading } from '@/components/ui/text-heading';
import { Icons, MODULE_LABELS } from '@/lib/config/client';
import { useRoles } from '../composables/useRoles';
import { RoleModal } from './RoleModal';
import { cn } from '@/lib/utils';
import type { Role } from '../types';

const L = MODULE_LABELS.rolesPermissions.roles;

export const RolesTab = () => {
    const {
        roles,
        loading,
        modalOpen,
        editingRole,
        deleteRole,
        handleEdit,
        handleCreate,
        handleModalClose,
        handleModalSuccess,
        isSystemRole,
        getLevelColor,
        getLevelBarColor,
    } = useRoles();

    return (
        <div className="space-y-6 animate-page-enter">
            {/* Header Actions */}
            <div className="flex justify-end pt-1">
                <Button onClick={handleCreate} className="gap-2 rounded-xl lowercase">
                    <Icons.plus className="size-5" /> {L.buttons.addRole}
                </Button>
            </div>

            {/* Roles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {roles.map((role: Role) => (
                    <Card key={role.id} className="group relative">
                        <CardContent className="space-y-6">
                            {/* Role Header */}
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "size-14 rounded-xl flex items-center justify-center transition-transform duration-500",
                                        role.level >= 90 ? "bg-muted text-amber-600" : "bg-muted text-primary"
                                    )}>
                                        {role.is_super ? <Icons.crown className="size-8" /> : <Icons.shield className="size-8" />}
                                    </div>
                                    <div>
                                        <TextHeading size="h4" className="lowercase">
                                            {role.display_name || role.name}
                                        </TextHeading>
                                        <p className="text-base font-normal text-muted-foreground lowercase">
                                            {role.name}
                                        </p>
                                    </div>
                                </div>
                                <div className={cn(
                                    "size-2.5 rounded-full",
                                    role.is_active ? "bg-emerald-500" : "bg-muted"
                                )} />
                            </div>

                            {/* Description */}
                            <p className="text-base font-normal text-muted-foreground min-h-[40px] leading-relaxed lowercase italic">
                                {role.description ? `"${role.description}"` : "no description provided"}
                            </p>

                            {/* Level Bar */}
                            <div className="bg-muted p-4 rounded-xl">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-base font-normal text-muted-foreground lowercase">
                                        {L.labels.level}
                                    </span>
                                    <span className="text-base font-normal text-foreground">
                                        {role.level} / 100
                                    </span>
                                </div>
                                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                    <div 
                                        className={cn(
                                            "h-full rounded-full transition-all duration-1000",
                                            role.level >= 90 ? "bg-amber-500" : "bg-primary"
                                        )} 
                                        style={{ width: `${Math.min(role.level, 100)}%` }} 
                                    />
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 pt-2">
                                {!isSystemRole(role.name) ? (
                                    <>
                                        <Button 
                                            variant="secondary" 
                                            onClick={() => handleEdit(role)} 
                                            className="flex-1 gap-2 rounded-lg lowercase"
                                        >
                                            <Icons.pencil className="size-5" /> edit
                                        </Button>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            onClick={() => deleteRole(role)}
                                            className="text-destructive"
                                        >
                                            <Icons.trash className="size-5" />
                                        </Button>
                                    </>
                                ) : (
                                    <Button 
                                        variant="secondary" 
                                        onClick={() => handleEdit(role)} 
                                        className="flex-1 gap-2 rounded-lg lowercase"
                                    >
                                        <Icons.pencil className="size-5" /> configure system role
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {roles.length === 0 && (
                    <div className="col-span-full py-20 text-center bg-muted rounded-3xl border border-dashed border-border flex flex-col items-center">
                        <Icons.info className="size-12 mb-4 text-muted-foreground" />
                        <p className="text-base font-normal text-muted-foreground lowercase">{L.messages.empty}</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            <RoleModal isOpen={modalOpen} role={editingRole} onClose={handleModalClose} onSuccess={handleModalSuccess} />
        </div>
    );
};
