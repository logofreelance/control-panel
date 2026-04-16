'use client';

import { Button, Card, CardContent } from '@/components/ui';
import { TextHeading } from '@/components/ui/text-heading';
import { Icons, MODULE_LABELS } from '@/lib/config/client';
import { usePermissions } from '../composables/usePermissions';
import { PermissionModal } from './PermissionModal';
import { cn } from '@/lib/utils';
import type { Permission } from '../types';

const L = MODULE_LABELS.rolesPermissions.permissions;

export const PermissionsTab = () => {
    const {
        permissions,
        grouped,
        loading,
        showModal,
        setShowModal,
        form,
        setForm,
        editingPermission,
        handleCreate,
        handleEdit,
        createPermission,
        updatePermission,
        deletePermission,
    } = usePermissions();

    return (
        <div className="space-y-6 animate-page-enter">
            {/* Header Actions */}
            <div className="flex justify-end pt-1">
                <Button onClick={handleCreate} className="gap-2 rounded-xl lowercase">
                    <Icons.plus className="size-5" /> {L.buttons.addPermission}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(grouped).map(([group, perms]) => (
                    <Card key={group} className="flex flex-col group">
                        <div className="px-6 py-4 bg-transparent border-b border-border flex items-center gap-3">
                            <div className="size-10 rounded-xl bg-muted flex items-center justify-center text-primary">
                                <Icons.tag className="size-5" />
                            </div>
                            <TextHeading size="h4" className="lowercase">
                                {group}
                            </TextHeading>
                        </div>
                        
                        <CardContent className="space-y-3 flex-1 pt-6">
                            {(perms as Permission[]).map((p) => (
                                <div key={p.id} className="flex items-center justify-between p-4 bg-muted rounded-xl group/item transition-all duration-300">
                                    <div className="flex-1 min-w-0 pr-3">
                                        <p className="font-normal text-base text-foreground lowercase truncate">{p.name}</p>
                                        {p.description && (
                                            <p className="text-base font-normal text-muted-foreground mt-0.5 line-clamp-1 italic lowercase">
                                                {p.description}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            onClick={() => handleEdit(p)} 
                                        >
                                            <Icons.pencil className="size-5" />
                                        </Button>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            onClick={() => deletePermission(p.id)} 
                                            className="text-destructive"
                                        >
                                            <Icons.trash className="size-5" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                ))}
                
                {permissions.length === 0 && (
                    <div className="col-span-full py-20 text-center bg-muted rounded-3xl border border-dashed border-border flex flex-col items-center">
                        <Icons.info className="size-12 mb-4 text-muted-foreground" />
                        <p className="text-base font-normal text-muted-foreground lowercase">{L.messages.empty}</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            <PermissionModal 
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                permission={editingPermission}
                form={form}
                setForm={setForm}
                onSubmit={editingPermission ? updatePermission : createPermission}
            />
        </div>
    );
};
