'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Heading, Text, Stack, Card } from '@/components/ui';
import { cn } from '@/lib/utils';
import { useConfig } from '@/modules/_core';
import { useRelations, type Relation, type AddRelationPayload } from '../composables';
import { RELATION_TYPES } from '../registry';
import { Icons } from '../config/icons';

interface CreateRelationFormProps {
    DatabaseTableId: number;
}

export const CreateRelationForm = ({ DatabaseTableId }: CreateRelationFormProps) => {
    const router = useRouter();
    const { id: targetId } = useParams();
    const { labels } = useConfig();
    const L = labels.mod.databaseSchema;
    const C = labels.common;

    const {
        targets,
        loading,
        addRelation
    } = useRelations(DatabaseTableId);

    const [submitting, setSubmitting] = useState(false);
    const [newRelation, setNewRelation] = useState<AddRelationPayload>({
        targetId: 0,
        type: 'belongs_to',
        alias: '',
    });



    // Handle Selection
    const handleSelectTarget = (id: number) => {
        setNewRelation(prev => {
            // If selecting system table (users, id=0), auto-reset to belongs_to
            if (id === 0 && ['has_one', 'has_many'].includes(prev.type)) {
                return { ...prev, targetId: id, type: 'belongs_to' };
            }
            return { ...prev, targetId: id };
        });
    };

    // Submit
    const handleSubmit = async () => {
        setSubmitting(true);
        const success = await addRelation(newRelation);
        setSubmitting(false);

        if (success) {
            router.push(targetId ? `/target/${targetId}/database-schema` : `/database-schema`); // Go back to list
            router.refresh();
        }
    };

    if (loading) {
        return <div className="p-12 text-center animate-pulse">{L.messages.relations.loadingRelations}</div>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <Card  className="p-8">
                <Stack direction="row" align="center" gap={4}>
                    <div className="w-14 h-14 rounded-4xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <Icons.link className="w-7 h-7" />
                    </div>
                    <div>
                        <Heading level={2}>{L.messages.relations.addRelation}</Heading>
                        <Text variant="muted" className="mt-1 text-lg">{L.messages.relations.createRelationship}</Text>
                    </div>
                </Stack>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Left Column: Target Selection */}
                <Card  className="p-8 h-fit">
                    <Stack direction="row" align="center" gap={3} className="mb-6">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0"><Icons.database className="w-5 h-5" /></div>
                        <div>
                            <Heading level={5}>{L.messages.relations.targetTable}</Heading>
                            <Text variant="muted" className="text-sm">{L.messages.relations.targetTableDesc || "Select the table to connect to"}</Text>
                        </div>
                    </Stack>

                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                        {targets.length === 0 && (
                            <div className="p-8 text-center bg-muted rounded-2xl border-2 border-dashed border-border">
                                <Text variant="muted" className="font-medium">{L.messages.relations.noTargets || "No available targets found."}</Text>
                            </div>
                        )}
                        {targets.map(t => (
                            <button
                                key={t.id}
                                type="button"
                                onClick={() => handleSelectTarget(t.id)}
                                className={cn(
                                    "w-full group relative p-4 rounded-xl border-2 text-left transition-all duration-200",
                                    newRelation.targetId === t.id
                                        ? 'bg-primary/5 border-primary'
                                        : 'bg-card border-border hover:border-primary/30 hover:bg-muted'
                                )}
                            >
                                <Stack direction="row" align="center" gap={4}>
                                    <div className={cn(
                                        "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                                        newRelation.targetId === t.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground group-hover:bg-card group-hover:text-primary'
                                    )}>
                                        <Icons.table className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className={cn("font-bold text-lg", newRelation.targetId === t.id ? 'text-primary' : 'text-foreground')}>
                                            {t.name}
                                        </div>
                                        <div className="text-xs text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded w-fit mt-1">
                                            {t.tableName}
                                        </div>
                                    </div>
                                    {newRelation.targetId === t.id && (
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-primary bg-card rounded-full p-1">
                                            <Icons.check className="w-5 h-5" />
                                        </div>
                                    )}
                                </Stack>
                            </button>
                        ))}
                    </div>
                </Card>

                {/* Right Column: Configuration */}
                <div className="space-y-6">
                    {/* Relation Type */}
                    <Card  className="p-8">
                        <Stack direction="row" align="center" gap={3} className="mb-6">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><Icons.settings className="w-5 h-5" /></div>
                            <div>
                                <Heading level={5}>{L.messages.relations.relationType}</Heading>
                                <Text variant="muted" className="text-sm">{L.messages.relations.relationTypeDesc || "Define how the tables relate"}</Text>
                            </div>
                        </Stack>

                        <div className="grid grid-cols-1 gap-3">
                            {RELATION_TYPES.map(type => {
                                // Disable Has One and Has Many when target is users (id=0)
                                const isSystemTarget = newRelation.targetId === 0;
                                const isDisabled = isSystemTarget && ['has_one', 'has_many'].includes(type.value);

                                return (
                                    <button
                                        key={type.value}
                                        type="button"
                                        onClick={() => !isDisabled && setNewRelation(prev => ({ ...prev, type: type.value as Relation['type'] }))}
                                        disabled={isDisabled}
                                        className={cn(
                                            "p-4 rounded-xl border-2 text-left transition-all relative overflow-hidden flex items-start gap-4",
                                            isDisabled
                                                ? 'opacity-50 cursor-not-allowed bg-muted border-border'
                                                : newRelation.type === type.value
                                                    ? 'border-primary bg-primary/5'
                                                    : 'border-border hover:border-border bg-card'
                                        )}
                                    >
                                        <div className={cn("text-2xl p-2 rounded-lg", newRelation.type === type.value && !isDisabled ? 'bg-primary/15' : 'bg-muted')}>
                                            {type.icon}
                                        </div>
                                        <div className="flex-1">
                                            <span className={cn("font-bold block", newRelation.type === type.value && !isDisabled ? 'text-primary' : 'text-foreground')}>
                                                {type.label}
                                            </span>
                                            <Text variant="muted" className="text-xs leading-tight mt-1 block">{type.desc}</Text>
                                            {isDisabled && (
                                                <span className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                                                    <Icons.alertTriangle className="w-3 h-3" />
                                                    {C.validation?.systemTableRestriction || "Not available for System Tables - use 'Belongs To'"}
                                                </span>
                                            )}
                                        </div>
                                        {newRelation.type === type.value && !isDisabled && <div className="ml-auto text-primary"><Icons.check className="w-5 h-5" /></div>}
                                    </button>
                                );
                            })}
                        </div>
                    </Card>

                    {/* Alias Config */}
                    <Card  className="p-8">
                        <Stack direction="row" align="center" gap={3} className="mb-6">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><Icons.edit className="w-5 h-5" /></div>
                            <div>
                                <Heading level={5}>{L.messages.relations.aliasOptional}</Heading>
                                <Text variant="muted" className="text-sm">{L.messages.relations.aliasOptionalDesc || "Custom name for API responses"}</Text>
                            </div>
                        </Stack>

                        <div>
                            <input
                                type="text"
                                value={newRelation.alias}
                                onChange={(e) => setNewRelation(prev => ({ ...prev, alias: e.target.value }))}
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
                        <Text variant="muted" className="text-sm hidden sm:block">
                            {newRelation.targetId ? <span className="text-emerald-500 font-bold flex items-center gap-1"><Icons.check className="w-4 h-4" /> {C.status?.readyToLink || "Ready to link"}</span> : (L.messages.relations.selectTarget || "Select a target")}
                        </Text>
                        <Button
                            onClick={handleSubmit}
                            isLoading={submitting}
                            disabled={!newRelation.targetId && newRelation.targetId !== 0} // Allow 0
                            size="lg"
                            className="px-8"
                        >
                            {L.messages.relations.addRelation}
                        </Button>
                    </Stack>
                </div>
            </div>
            <div className="h-8"></div>
        </div>
    );
};
