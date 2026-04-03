'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Heading, Text, Stack, Card } from '@/components/ui';
import { cn } from '@/lib/utils';
import { useConfig } from '@/modules/_core';
import { useRelations, type Relation } from '../composables';
import { RELATION_TYPES } from '../registry';

interface EditRelationFormProps {
    DatabaseTableId: number;
    relationName: string; // This is the localKey / column name
}

export const EditRelationForm = ({ DatabaseTableId, relationName }: EditRelationFormProps) => {
    const router = useRouter();
    const { labels, icons: Icons } = useConfig();
    const L = labels.mod.databaseSchema;
    const C = labels.common;

    const { relations, loading, updateRelation } = useRelations(DatabaseTableId);

    // Find the relation being edited
    const [relation, setRelation] = useState<Relation | null>(null);
    const [form, setForm] = useState({
        type: 'belongs_to' as Relation['type'],
        alias: '',
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!loading && relations.length > 0) {
            // Find by localKey (column name)
            const found = relations.find(r => r.localKey === relationName);
            if (found) {
                setRelation(found);
                setForm({
                    type: found.type,
                    alias: found.alias,
                });
            } else {
                // Not found, maybe redirect or show error
                // console.warn('Relation not found', relationName);
            }
        }
    }, [relations, loading, relationName]);

    const handleSubmit = async () => {
        setSubmitting(true);
        const success = await updateRelation(relationName, form);
        if (success) {
            router.back();
            router.refresh();
        }
        setSubmitting(false);
    };

    if (loading) {
        return <div className="p-12 text-center animate-pulse">{L.messages.relations.loadingRelations || "Loading relation details..."}</div>;
    }

    if (!relation) {
        return (
            <div className="p-8 text-center bg-muted rounded-2xl border border-border">
                <Icons.warning className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <Heading level={5}>{C.messages.notFound || "Relation Not Found"}</Heading>
                <Text variant="muted" className="mb-6">{C.messages.notFoundDesc || "Could not find relation for column:"} <code className="font-mono bg-muted px-1 rounded">{relationName}</code></Text>
                <Button onClick={() => router.back()}>{C.actions.goBack || "Go Back"}</Button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <Card  className="p-8">
                <Stack direction="row" align="center" gap={4}>
                    <div className="w-14 h-14 rounded-4xl bg-primary/10 flex items-center justify-center text-primary">
                        <Icons.edit className="w-7 h-7" />
                    </div>
                    <div>
                        <Heading level={2}>{L.titles.editResource || "Edit Relation"}</Heading>
                        <Text variant="muted" className="mt-1 text-lg">{L.messages.relations.updateMetadata || "Update metadata for"} <strong className="text-foreground">{relation.target?.name}</strong></Text>
                    </div>
                </Stack>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Left Column: Locked Info */}
                <Card  className="p-8 h-fit opacity-80">
                    <Stack direction="row" align="center" gap={3} className="mb-6">
                        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground"><Icons.lock className="w-5 h-5" /></div>
                        <div>
                            <Heading level={5}>{L.messages.relations.targetConfig || "Target Configuration"}</Heading>
                            <Text variant="muted" className="text-sm">{L.messages.relations.fixedProps || "Fixed physical properties"}</Text>
                        </div>
                    </Stack>

                    <div className="space-y-4">
                        <div className="p-4 bg-muted rounded-xl border border-border">
                            <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">{L.messages.relations.targetTable || "Target Table"}</label>
                            <Stack direction="row" align="center" gap={3}>
                                <Icons.table className="w-5 h-5 text-primary" />
                                <div>
                                    <div className="font-bold text-foreground">{relation.target?.name}</div>
                                    <div className="text-xs font-mono text-muted-foreground">{relation.target?.tableName}</div>
                                </div>
                            </Stack>
                        </div>

                        <div className="p-4 bg-muted rounded-xl border border-border">
                            <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">{L.messages.relations.fkColumn || "Foreign Key Column"}</label>
                            <Stack direction="row" align="center" gap={3}>
                                <Icons.key className="w-5 h-5 text-amber-500" />
                                <div className="font-mono font-bold text-foreground">{relation.localKey}</div>
                            </Stack>
                        </div>
                    </div>
                </Card>

                {/* Right Column: Editable Info */}
                <div className="space-y-6">
                    {/* Relation Type */}
                    <Card  className="p-8">
                        <Stack direction="row" align="center" gap={3} className="mb-6">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><Icons.settings className="w-5 h-5" /></div>
                            <div>
                                <Heading level={5}>{L.messages.relations.relationType}</Heading>
                                <Text variant="muted" className="text-sm">{L.messages.relations.defineRel || "Define how the tables relate"}</Text>
                            </div>
                        </Stack>

                        <div className="grid grid-cols-1 gap-3">
                            {RELATION_TYPES.map(type => (
                                <button
                                    key={type.value}
                                    type="button"
                                    onClick={() => setForm(prev => ({ ...prev, type: type.value as Relation['type'] }))}
                                    className={cn(
                                        "p-4 rounded-xl border-2 text-left transition-all relative overflow-hidden flex items-start gap-4",
                                        form.type === type.value
                                            ? 'border-primary bg-primary/5'
                                            : 'border-border hover:border-border bg-card'
                                    )}
                                >
                                    <div className={cn("text-2xl p-2 rounded-lg", form.type === type.value ? 'bg-primary/15' : 'bg-muted')}>
                                        {type.icon}
                                    </div>
                                    <div>
                                        <span className={cn("font-bold block", form.type === type.value ? 'text-primary' : 'text-foreground')}>
                                            {type.label}
                                        </span>
                                        <Text variant="muted" className="text-xs leading-tight mt-1 block">{type.desc}</Text>
                                    </div>
                                    {form.type === type.value && <div className="ml-auto text-primary"><Icons.check className="w-5 h-5" /></div>}
                                </button>
                            ))}
                        </div>
                    </Card>

                    {/* Alias Config */}
                    <Card  className="p-8">
                        <Stack direction="row" align="center" gap={3} className="mb-6">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><Icons.edit className="w-5 h-5" /></div>
                            <div>
                                <Heading level={5}>{L.messages.relations.aliasOptional}</Heading>
                                <Text variant="muted" className="text-sm">{L.messages.relations.customName || "Custom name for API responses"}</Text>
                            </div>
                        </Stack>

                        <div>
                            <input
                                type="text"
                                value={form.alias}
                                onChange={(e) => setForm(prev => ({ ...prev, alias: e.target.value }))}
                                placeholder={L.messages.relations.aliasPlaceholder}
                                className="w-full px-4 py-3.5 rounded-xl border border-border focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium"
                            />
                            <Stack direction="row" align="center" gap={2} className="text-xs text-muted-foreground mt-3">
                                <Icons.info className="w-4 h-4" />
                                {L.messages.relations.aliasDescription}
                            </Stack>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Sticky Actions Footer */}
            <div className="sticky bottom-4 z-10">
                <div className="bg-card border border-border p-4 rounded-2xl flex items-center justify-between max-w-4xl mx-auto">
                    <Button variant="ghost" onClick={() => router.back()} className="text-muted-foreground hover:text-foreground">
                        {C.actions.cancel}
                    </Button>
                    <Stack direction="row" align="center" gap={4}>
                        <Button
                            onClick={handleSubmit}
                            isLoading={submitting}
                            size="lg"
                            className="px-8"
                        >
                            {C.actions.saveChanges || "Save Changes"}
                        </Button>
                    </Stack>
                </div>
            </div>
            <div className="h-8"></div>
        </div>
    );
};
