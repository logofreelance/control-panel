'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
    Button, 
    Card, 
    CardHeader, 
    CardTitle, 
    CardDescription, 
    CardContent, 
    Badge,
} from '@/components/ui';
import { TextHeading } from '@/components/ui/text-heading';
import { cn } from '@/lib/utils';
import { useConfig } from '@/modules/_core';
import { TargetLayout } from '@/components/layout/TargetLayout';
import { Icons, MODULE_LABELS } from '@/lib/config/client';
import { useRelations, type Relation, useDatabaseSchema } from '../composables';
import { RELATION_TYPES } from '../registry';

const L = MODULE_LABELS.databaseSchema;

interface EditRelationFormProps {
    DatabaseTableId: string | number;
    relationId: string | number;
}

export const EditRelationForm = ({ DatabaseTableId, relationId }: EditRelationFormProps) => {
    const router = useRouter();
    const params = useParams();
    const nodeId = params.id as string;
    
    const { labels, icons: configIcons } = useConfig();
    const C = labels.common;

    const { relations, loading, updateRelation } = useRelations(DatabaseTableId);
    const { items: sources = [] } = useDatabaseSchema();

    const [relation, setRelation] = useState<Relation | null>(null);
    const [form, setForm] = useState({
        type: 'belongs_to' as Relation['type'],
        alias: '',
    });
    const [submitting, setSubmitting] = useState(false);

    // Initial state setup
    useEffect(() => {
        if (!loading && relations.length > 0) {
            const ridStr = String(relationId);
            const found = relations.find((r) => String(r.id) === ridStr || r.localKey === ridStr);
            if (found) {
                setRelation(found);
                setForm({
                    type: found.type,
                    alias: found.alias,
                });
            }
        }
    }, [relations, loading, relationId]);

    const DatabaseTableName = sources.find(s => String(s.id) === String(DatabaseTableId))?.name || 'unknown';

    const handleSubmit = async () => {
        setSubmitting(true);
        const success = await updateRelation(relationId, form);
        setSubmitting(false);

        if (success) {
            const path = nodeId ? `/target/${nodeId}/database-schema` : `/database-schema`;
            router.push(path);
            router.refresh();
        }
    };

    if (!relation && !loading) {
        return (
            <TargetLayout>
                <div className="flex flex-col items-center justify-center py-32 text-center max-w-md mx-auto space-y-8 animate-page-enter">
                    <div className="size-20 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 shadow-xl shadow-rose-500/10">
                        <Icons.warning className="size-10" />
                    </div>
                    <div className="space-y-3">
                        <TextHeading size="h4" className="lowercase text-foreground/80">
                            {C.messages.notFound || 'relation not found'}
                        </TextHeading>
                        <p className="text-sm text-muted-foreground lowercase opacity-60">
                            could not find relation for column:{' '}
                            <code className="font-mono bg-muted px-1 rounded">{relationId}</code>
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => router.back()}
                        className="h-11 px-8 rounded-xl border-border/40 lowercase font-bold hover:bg-muted"
                    >
                        {C.actions.goBack}
                    </Button>
                </div>
            </TargetLayout>
        );
    }

    return (
        <TargetLayout>
            <div className="flex flex-col gap-6 animate-page-enter max-w-5xl mx-auto pb-20">
                {/* Page Header */}
                <header className="px-1 space-y-3">
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="h-9 px-0 hover:bg-transparent -ml-1 text-muted-foreground/60 hover:text-foreground transition-colors group lowercase text-sm font-medium"
                    >
                        <Icons.arrowLeft className="size-5 mr-3 group-hover:-translate-x-1 transition-transform" />
                        back to database
                    </Button>
                    <div className="flex items-center gap-4">
                         <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                            <Icons.edit className="size-6" />
                         </div>
                         <div>
                            <TextHeading as="h1" size="h3" className="font-semibold lowercase leading-tight">edit relation</TextHeading>
                            <p className="text-base md:text-lg text-muted-foreground font-normal lowercase opacity-70">update relationship metadata to another data source</p>
                         </div>
                    </div>
                </header>

                <div className="flex flex-col gap-6">
                    {/* Section: Read-only Identity (Styled like Target Table selection) */}
                    <Card className="opacity-80">
                        <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-4 border-b border-border/50">
                            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                <Icons.database className="size-5" />
                            </div>
                            <div className="flex-1">
                                <CardTitle className="text-xl md:text-2xl font-semibold lowercase leading-none mb-1">
                                    target table
                                </CardTitle>
                                <CardDescription className="text-base text-muted-foreground font-normal lowercase">
                                    fixed identity of the establish link.
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl border border-primary/20 bg-primary/5 flex items-center gap-3">
                                    <div className="size-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                                        <Icons.table className="size-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <TextHeading size="h5" className="font-semibold truncate lowercase text-primary leading-none mb-1 mt-1">{relation?.target?.name || 'unknown'}</TextHeading>
                                        <p className="text-sm text-muted-foreground font-normal lowercase">{relation?.target?.tableName || 'unknown_table'}</p>
                                    </div>
                                    <div className="size-5 rounded-full bg-primary text-white flex items-center justify-center">
                                        <Icons.lock className="size-3" />
                                    </div>
                                </div>

                                <div className="p-4 rounded-2xl border border-border bg-muted/10 flex items-center gap-3">
                                    <div className="size-10 rounded-xl bg-muted text-muted-foreground flex items-center justify-center">
                                        <Icons.key className="size-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <TextHeading size="h5" className="font-semibold truncate lowercase text-foreground leading-none mb-1 mt-1">{relation?.localKey}</TextHeading>
                                        <p className="text-sm text-muted-foreground font-normal lowercase">foreign key link</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Section: Relation Type Grid (Adopted from CreateRelationForm) */}
                    <Card>
                        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/50 pb-4">
                            <div className="flex items-center gap-4">
                                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                    <Icons.settings className="size-5" />
                                </div>
                                <div className="flex-1">
                                    <CardTitle className="text-xl md:text-2xl font-semibold lowercase leading-none mb-1">
                                        {L.messages.relations.relationType}
                                    </CardTitle>
                                    <CardDescription className="text-base text-muted-foreground font-normal lowercase">
                                        define the nature of the relationship.
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {RELATION_TYPES.map(type => {
                                    const isSystemTarget = String(relation?.targetId) === '0';
                                    const isDisabled = isSystemTarget && ['has_one', 'has_many'].includes(type.value);
                                    const isSelected = form.type === type.value;

                                    return (
                                        <button
                                            key={type.value}
                                            type="button"
                                            disabled={isDisabled}
                                            onClick={() => !isDisabled && setForm(prev => ({ ...prev, type: type.value as any }))}
                                            className={cn(
                                                "p-4 rounded-2xl transition-all duration-300 border text-left flex items-start gap-4 relative group",
                                                isDisabled ? 'opacity-30 cursor-not-allowed bg-muted/5 border-border' :
                                                isSelected 
                                                    ? 'bg-primary/5 border-primary/40 shadow-sm' 
                                                    : 'bg-muted/10 border-transparent hover:border-primary/10 hover:bg-muted/20'
                                            )}
                                        >
                                            <div className={cn(
                                                "size-12 rounded-xl flex items-center justify-center text-2xl transition-all duration-300 shrink-0",
                                                isDisabled ? 'bg-muted text-muted-foreground' :
                                                isSelected ? 'bg-primary text-white shadow-lg shadow-primary/10' : 'bg-background text-muted-foreground group-hover:bg-primary/5'
                                            )}>
                                                {type.icon}
                                            </div>
                                            <div className="flex-1">
                                                <TextHeading size="h5" className={cn(
                                                    "font-semibold lowercase leading-none mb-1.5",
                                                    isSelected ? "text-primary" : "text-foreground"
                                                )}>{type.label}</TextHeading>
                                                <p className="text-base text-muted-foreground font-normal lowercase leading-snug">{type.desc.toLowerCase()}</p>
                                                
                                                {isDisabled && (
                                                    <div className="mt-2 flex items-center gap-2 text-sm font-normal text-destructive lowercase">
                                                        <Icons.alertTriangle className="size-4" />
                                                        restricted for system tables
                                                    </div>
                                                )}
                                            </div>
                                            {isSelected && !isDisabled && (
                                                <div className="size-5 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
                                                    <Icons.check className="size-3" />
                                                </div>
                                            )}
                                        </button>

                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Section: Configuration */}
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-4 border-b border-border/50">
                            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                <Icons.code className="size-5" />
                            </div>
                            <div className="flex-1">
                                <CardTitle className="text-xl md:text-2xl font-semibold lowercase leading-none mb-1">
                                    Display Alias
                                </CardTitle>
                                <CardDescription className="text-base text-muted-foreground font-normal lowercase">
                                    customize how this relationship is identified in queries.
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="space-y-3">
                                <label className="text-base font-semibold lowercase text-foreground block px-1">
                                    Relationship Display Alias
                                </label>
                                <input
                                    type="text"
                                    value={form.alias}
                                    onChange={(e) => setForm(prev => ({ ...prev, alias: e.target.value }))}
                                    placeholder="optional: custom alias name (e.g. author_details)"
                                    className="w-full h-12 px-4 rounded-xl bg-muted/20 border-border border focus:ring-1 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground lowercase text-base font-normal"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-between gap-4 pt-4 border-t border-border/50 mt-4 px-1">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => router.back()}
                        className="h-11 px-8 rounded-xl font-medium lowercase"
                    >
                        cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        isLoading={submitting}
                        className="h-11 px-10 rounded-xl font-semibold lowercase shadow-lg shadow-primary/10"
                    >
                        save changes
                    </Button>
                </div>
            </div>
        </TargetLayout>
    );
};
