'use client';

/**
 * CreateRelationForm - Flat Luxury UI Refactor
 * Form for creating table relations with consistent design system and TargetLayout integration
 */

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
    Empty,
    EmptyHeader,
    EmptyMedia,
    EmptyDescription
} from '@/components/ui';
import { TextHeading } from '@/components/ui/text-heading';
import { cn } from '@/lib/utils';
import { useConfig } from '@/modules/_core';
import { TargetLayout } from '@/components/layout/TargetLayout';
import { Icons, MODULE_LABELS } from '@/lib/config/client';
import { useRelations, type Relation, type AddRelationPayload } from '../composables';
import { RELATION_TYPES } from '../registry';

const L = MODULE_LABELS.databaseSchema;

interface CreateRelationFormProps {
    DatabaseTableId: string | number;
}

export const CreateRelationForm = ({ DatabaseTableId }: CreateRelationFormProps) => {
    const router = useRouter();
    const params = useParams();
    const nodeId = params.id as string;
    
    const { labels, icons: Icons } = useConfig();
    const C = labels.common;

    const {
        targets,
        loading,
        fetchColumns,
        addRelation
    } = useRelations(DatabaseTableId);

    const [submitting, setSubmitting] = useState(false);
    const [sourceColumns, setSourceColumns] = useState<any[]>([]);
    const [targetColumns, setTargetColumns] = useState<any[]>([]);
    
    const [newRelation, setNewRelation] = useState<AddRelationPayload>({
        targetId: -1, // Use -1 as unselected
        type: 'belongs_to',
        localKey: '',
        foreignKey: '',
        alias: '',
    });

    // Fetch source columns on mount
    useEffect(() => {
        const loadSourceColumns = async () => {
            const cols = await fetchColumns(DatabaseTableId);
            setSourceColumns(cols);
        };
        loadSourceColumns();
    }, [DatabaseTableId, fetchColumns]);

    // Fetch target columns when target changes
    useEffect(() => {
        if (newRelation.targetId !== -1) {
            const loadTargetColumns = async () => {
                const cols = await fetchColumns(newRelation.targetId);
                setTargetColumns(cols);
            };
            loadTargetColumns();
        } else {
            setTargetColumns([]);
        }
    }, [newRelation.targetId, fetchColumns]);

    const handleSelectTarget = (id: string | number) => {
        setNewRelation(prev => {
            const isSystemTarget = id === 0;
            const newType = (isSystemTarget && ['has_one', 'has_many'].includes(prev.type)) 
                ? 'belongs_to' as const 
                : prev.type;
            
            return { 
                ...prev, 
                targetId: id, 
                type: newType,
                foreignKey: 'id', // Default foreign key is usually id
            };
        });
    };

    const handleSubmit = async () => {
        if (newRelation.targetId === -1 || !newRelation.localKey || !newRelation.foreignKey) return;
        setSubmitting(true);
        const success = await addRelation(newRelation);
        setSubmitting(false);

        if (success) {
            const path = nodeId ? `/target/${nodeId}/database-schema` : `/database-schema`;
            router.push(path);
            router.refresh();
        }
    };


    return (
        <TargetLayout>
            <div className="flex flex-col gap-4 animate-page-enter max-w-5xl mx-auto pb-10">
                {/* Page Header */}
                <header className="px-1 space-y-3">
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                    >
                        <Icons.arrowLeft className="size-5 mr-3" />
                        back to database
                    </Button>
                    <div className="flex items-center gap-4">
                         <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                            <Icons.link className="size-6" />
                         </div>
                         <div>
                            <TextHeading as="h1" size="h3" className="font-semibold lowercase">{L.messages.relations.addRelation}</TextHeading>
                            <p className="text-base md:text-lg text-muted-foreground font-normal lowercase">{L.messages.relations.createRelationship.toLowerCase()}</p>
                         </div>
                    </div>
                </header>

                <div className="flex flex-col gap-6">
                    {/* Section: Target Selection */}
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-4 border-b border-border/50">
                            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                <Icons.database className="size-5" />
                            </div>
                            <div className="flex-1">
                                <CardTitle className="text-xl md:text-2xl font-semibold lowercase leading-none mb-1">
                                    {L.messages.relations.targetTable}
                                </CardTitle>
                                <CardDescription className="text-base text-muted-foreground font-normal lowercase">
                                    select which table you want to establish a link with.
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                            {targets.length === 0 ? (
                                <Empty className="py-10 border-dashed border-border/40">
                                    <EmptyHeader>
                                        <EmptyMedia variant="icon">
                                            <Icons.lock className="size-10 text-muted-foreground" />
                                        </EmptyMedia>
                                        <EmptyDescription className="text-base md:text-lg font-normal lowercase">{L.messages.relations.noTargets || "no targets found."}</EmptyDescription>
                                    </EmptyHeader>
                                </Empty>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {targets.map(t => {
                                        const isSelected = newRelation.targetId === t.id;
                                        return (
                                            <button
                                                key={t.id}
                                                type="button"
                                                onClick={() => handleSelectTarget(t.id)}
                                                className={cn(
                                                    "group relative p-4 rounded-2xl transition-all duration-300 border text-left",
                                                    isSelected 
                                                        ? 'bg-primary/5 border-primary/40' 
                                                        : 'bg-muted/10 border-transparent hover:border-primary/20 hover:bg-muted/20'
                                                )}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        "size-10 rounded-xl flex items-center justify-center transition-all duration-300",
                                                        isSelected ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-background text-muted-foreground group-hover:bg-primary/5'
                                                    )}>
                                                        <Icons.table className="size-5" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <TextHeading size="h5" className={cn(
                                                            "font-semibold truncate lowercase leading-none mb-1 mt-1",
                                                            isSelected ? "text-primary" : "text-foreground"
                                                        )}>{t.name}</TextHeading>
                                                        <p className="text-sm text-muted-foreground font-normal lowercase">{t.tableName}</p>
                                                    </div>
                                                    {isSelected && (
                                                        <div className="size-5 rounded-full bg-primary text-white flex items-center justify-center">
                                                            <Icons.check className="size-3" />
                                                        </div>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Section: Relation Type */}
                    <Card className={cn(newRelation.targetId === -1 && "opacity-50 pointer-events-none transition-opacity")}>
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
                                    const isSystemTarget = newRelation.targetId === 0;
                                    const isDisabled = isSystemTarget && ['has_one', 'has_many'].includes(type.value);
                                    const isSelected = newRelation.type === type.value;

                                    return (
                                        <button
                                            key={type.value}
                                            type="button"
                                            disabled={isDisabled}
                                            onClick={() => !isDisabled && setNewRelation(prev => ({ ...prev, type: type.value as any }))}
                                            className={cn(
                                                "p-4 rounded-2xl transition-all duration-300 border text-left flex items-start gap-4 relative group",
                                                isDisabled ? 'opacity-30 cursor-not-allowed bg-muted/5 border-border' :
                                                isSelected 
                                                    ? 'bg-primary/5 border-primary/40' 
                                                    : 'bg-muted/10 border-transparent hover:border-primary/10 hover:bg-muted/20'
                                            )}
                                        >
                                            <div className={cn(
                                                "size-12 rounded-xl flex items-center justify-center text-2xl transition-all duration-300 shrink-0",
                                                isDisabled ? 'bg-muted text-muted-foreground' :
                                                isSelected ? 'bg-primary text-white shadow-primary/20' : 'bg-background text-muted-foreground group-hover:bg-primary/5'
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

                    {/* Section: Keys Selection - ONLY SHOW IF TARGET SELECTED */}
                    {newRelation.targetId !== -1 && (
                        <Card>
                            <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-4 border-b border-border/50">
                                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                    <Icons.key className="size-5" />
                                </div>
                                <div className="flex-1">
                                    <CardTitle className="text-xl md:text-2xl font-semibold lowercase leading-none mb-1">
                                        Configuration
                                    </CardTitle>
                                    <CardDescription className="text-base text-muted-foreground font-normal lowercase">
                                        define how these tables should be connected based on "{newRelation.type.replace('_', ' ')}"
                                    </CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                {/* Dynamic Helper Guide */}
                                <div className="mb-6 p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-start gap-4">
                                    <Icons.info className="size-5 text-primary shrink-0 mt-0.5" />
                                    <div className="text-sm font-normal text-primary/80 lowercase leading-relaxed">
                                        {newRelation.type === 'belongs_to' ? (
                                            <>
                                                <strong className="font-semibold block mb-1">guide for 'belongs to' (child points to parent):</strong>
                                                choose <span className="font-mono text-xs bg-primary/10 px-1 py-0.5 rounded text-primary">..._id</span> for the <strong>local column</strong> (because this table stores the key). <br/>
                                                choose <span className="font-mono text-xs bg-primary/10 px-1 py-0.5 rounded text-primary">id</span> for the <strong>foreign column</strong> (this is the parent's actual key).
                                            </>
                                        ) : (
                                            <>
                                                <strong className="font-semibold block mb-1">guide for '{newRelation.type.replace('_', ' ')}' (parent points to child):</strong>
                                                choose <span className="font-mono text-xs bg-primary/10 px-1 py-0.5 rounded text-primary">id</span> for the <strong>local column</strong> (because this is your actual key). <br/>
                                                choose <span className="font-mono text-xs bg-primary/10 px-1 py-0.5 rounded text-primary">..._id</span> for the <strong>foreign column</strong> (because the target table is storing your key).
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                    <div className="space-y-3">
                                        <label className="text-base font-semibold lowercase text-foreground block">
                                            Local Column (Source)
                                        </label>
                                        <select
                                            value={newRelation.localKey}
                                            onChange={(e) => setNewRelation(prev => ({ ...prev, localKey: e.target.value }))}
                                            className="w-full h-12 px-4 rounded-xl bg-muted/20 border-border border focus:ring-1 focus:ring-primary/20 outline-none transition-all lowercase text-base font-normal appearance-none"
                                        >
                                            <option value="">select field...</option>
                                            {sourceColumns.map(col => (
                                                <option key={col.name} value={col.name}>{col.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-base font-semibold lowercase text-foreground block">
                                            Foreign Column (Target)
                                        </label>
                                        <select
                                            value={newRelation.foreignKey}
                                            onChange={(e) => setNewRelation(prev => ({ ...prev, foreignKey: e.target.value }))}
                                            className="w-full h-12 px-4 rounded-xl bg-muted/20 border-border border focus:ring-1 focus:ring-primary/20 outline-none transition-all lowercase text-base font-normal appearance-none"
                                        >
                                            <option value="">select field...</option>
                                            {targetColumns.map(col => (
                                                <option key={col.name} value={col.name}>{col.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-base font-semibold lowercase text-foreground block">
                                        Relationship Display Alias
                                    </label>
                                    <input
                                        type="text"
                                        value={newRelation.alias}
                                        onChange={(e) => setNewRelation(prev => ({ ...prev, alias: e.target.value }))}
                                        placeholder="optional: custom alias name (e.g. author_details)"
                                        className="w-full h-12 px-4 rounded-xl bg-muted/20 border-border border focus:ring-1 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground lowercase text-base font-normal"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    )}


                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-between gap-4 pt-4 border-t border-border/50 mt-4">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => router.back()}
                    >
                        cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        isLoading={submitting}
                        disabled={newRelation.targetId === -1 || !newRelation.localKey || !newRelation.foreignKey}
                    >
                        add relation
                    </Button>
                </div>
            </div>
        </TargetLayout>
    );
};
