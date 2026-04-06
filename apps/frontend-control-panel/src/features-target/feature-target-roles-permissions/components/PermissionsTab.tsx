'use client';

import { Button, Card, CardContent } from '@/components/ui';
import { TextHeading } from '@/components/ui/text-heading';
import { Icons, MODULE_LABELS } from '@/lib/config/client';
import { usePermissions } from '../composables/usePermissions';
import { PageLoadingSkeleton } from '@/modules/_core';
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

    if (loading) return <PageLoadingSkeleton showStats={false} contentRows={4} />;

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
                    <Card key={group} className="bg-card border-none shadow-sm overflow-hidden flex flex-col group">
                        <div className="px-6 py-4 bg-muted/20 border-b border-border/5 flex items-center gap-3">
                            <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <Icons.tag className="size-4" />
                            </div>
                            <TextHeading size="h5" className="text-sm font-semibold lowercase text-foreground">
                                {group}
                            </TextHeading>
                        </div>
                        
                        <CardContent className="p-6 space-y-3 flex-1">
                            {(perms as Permission[]).map((p) => (
                                <div key={p.id} className="flex items-center justify-between p-4 bg-muted/20 rounded-xl group/item hover:bg-muted/40 transition-all duration-300">
                                    <div className="flex-1 min-w-0 pr-3">
                                        <p className="font-semibold text-sm text-foreground lowercase truncate">{p.name}</p>
                                        {p.description && (
                                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1 italic lowercase">
                                                {p.description}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            onClick={() => handleEdit(p)} 
                                            className="size-9 p-0 rounded-lg text-muted-foreground hover:text-primary"
                                        >
                                            <Icons.pencil className="size-4" />
                                        </Button>
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            onClick={() => deletePermission(p.id)} 
                                            className="size-9 p-0 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                                        >
                                            <Icons.trash className="size-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                ))}
                
                {permissions.length === 0 && (
                    <div className="col-span-full py-20 text-center bg-muted/10 rounded-3xl border border-dashed border-border/20">
                        <Icons.info className="size-12 mx-auto mb-4 text-muted-foreground/30" />
                        <p className="text-muted-foreground lowercase">{L.messages.empty}</p>
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
