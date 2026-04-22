'use client';

import { useState } from 'react';
import { 
    Button, 
    Input, 
    Card, 
    CardContent, 
    Badge, 
    Field, 
    FieldLabel,
    Empty,
    EmptyDescription
} from '@/components/ui';
import { TextHeading } from '@/components/ui/text-heading';
import { Icons } from '@/lib/config/client';
import { useDatabaseCategories } from '../composables';
import { cn } from '@/lib/utils';

export function CategoryManager({ onUpdate }: { onUpdate: () => void }) {
    const { items: categories = [], create, remove, loading } = useDatabaseCategories();
    const [newName, setNewName] = useState('');
    const [newColor, setNewColor] = useState('#ec4899'); // Default pink
    const [newIcon, setNewIcon] = useState('folder');
    const [isCreating, setIsCreating] = useState(false);

    const handleCreate = async () => {
        if (!newName) return;
        setIsCreating(true);
        const result = await create({
            name: newName,
            color: newColor,
            icon: newIcon
        });
        if (result) {
            setNewName('');
            onUpdate();
        }
        setIsCreating(false);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this category? Tables in this category will become uncategorized.')) {
            await remove(id);
            onUpdate();
        }
    };

    const COLORS = [
        '#ec4899', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#6366f1'
    ];

    const ICONS = ['folder', 'layers', 'workflow', 'database', 'layout', 'package', 'tag', 'settings', 'link', 'gem'];

    return (
        <div className="space-y-8 py-2">
            <div className="space-y-6">
                <Card>
                    <CardContent className="space-y-6">
                        <Field>
                            <FieldLabel>category name</FieldLabel>
                            <Input 
                                placeholder="e.g. logo package projects"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                            />
                        </Field>
                        
                        
                        <Field>
                            <FieldLabel>accent color</FieldLabel>
                            <div className="flex flex-wrap gap-2.5">
                                {COLORS.map(c => (
                                    <button 
                                        key={c}
                                        type="button"
                                        onClick={() => setNewColor(c)}
                                        className={cn(
                                            "size-8 rounded-xl border-2 transition-all",
                                            newColor === c ? "scale-110 border-background shadow-md ring-2 ring-primary/40 ring-offset-2" : "border-transparent opacity-60 hover:opacity-100"
                                        )}
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                            </div>
                        </Field>

                        <Field>
                            <FieldLabel>icon</FieldLabel>
                            <div className="flex flex-wrap gap-2.5">
                                {ICONS.map(i => {
                                    const IconComp = (Icons as any)[i] || Icons.folder;
                                    return (
                                        <button 
                                            key={i}
                                            type="button"
                                            onClick={() => setNewIcon(i)}
                                            className={cn(
                                                "size-10 rounded-xl border flex items-center justify-center transition-all",
                                                newIcon === i ? "bg-primary/5 border-primary/20 text-primary ring-2 ring-primary/10" : "bg-muted/10 border-transparent hover:bg-muted/30 text-muted-foreground/60"
                                            )}
                                        >
                                            <IconComp className="size-5" />
                                        </button>
                                    );
                                })}
                            </div>
                        </Field>

                        <Button 
                            className="w-full" 
                            onClick={handleCreate} 
                            disabled={!newName || isCreating}
                            isLoading={isCreating}
                        >
                            <Icons.plus className="size-4 mr-2" /> create category
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                <TextHeading size="h6" className="font-semibold lowercase opacity-40 ml-1">
                    existing categories
                </TextHeading>
                {categories.length === 0 ? (
                    <Empty className="py-12 bg-muted/5 border-dashed">
                        <EmptyDescription className="lowercase">no categories created yet</EmptyDescription>
                    </Empty>
                ) : (
                    <div className="grid grid-cols-1 gap-3">
                        {categories.map(cat => (
                            <Card key={cat.id} size="sm" className="group">
                                <CardContent className="flex items-center justify-between py-3">
                                    <div className="flex items-center gap-4">
                                        <div 
                                            className="size-10 rounded-2xl flex items-center justify-center shadow-sm border border-border/5"
                                            style={{ backgroundColor: `${cat.color}10`, color: cat.color }}
                                        >
                                            {(() => {
                                                const IconComp = (Icons as any)[cat.icon || 'folder'] || Icons.folder;
                                                return <IconComp className="size-5" />;
                                            })()}
                                        </div>
                                        <span className="font-semibold text-base lowercase">{cat.name}</span>
                                    </div>
                                    <Button 
                                        variant="ghost" 
                                        size="icon-sm"
                                        className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-rose-500 hover:bg-rose-500/5"
                                        onClick={() => handleDelete(cat.id)}
                                    >
                                        <Icons.trash className="size-4" />
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
