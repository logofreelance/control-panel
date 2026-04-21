import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Icons } from '@/lib/config/client';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { TextHeading } from '@/components/ui/TextHeading';
import { useRelations } from '@/features-target/feature-target-database-schema/composables/useRelations';

interface RecursiveRelationPickerProps {
    sourceId: string | number;
    depth?: number;
    value: any; // Tree structure: { [alias]: { targetId, fields: [], relations: {} } }
    onChange: (newValue: any) => void;
    label?: string;
}

export const RecursiveRelationPicker: React.FC<RecursiveRelationPickerProps> = ({ 
    sourceId, 
    depth = 0, 
    value = {}, 
    onChange,
    label
}) => {
    const { relations, fetchRelations, fetchColumns, loading } = useRelations(sourceId);
    const [allPossibleRelations, setAllPossibleRelations] = useState<any[]>([]);
    const [tableColumns, setTableColumns] = useState<Record<string, any[]>>({});

    useEffect(() => {
        const load = async () => {
            if (!sourceId) return;
            try {
                await fetchRelations(); 
            } catch (err) {}
        };
        load();
    }, [sourceId, fetchRelations]);

    const toggleRelationActive = (alias: string, targetId: string) => {
        const newValue = { ...value };
        if (newValue[alias]) {
            delete newValue[alias];
        } else {
            newValue[alias] = {
                targetId,
                fields: [],
                relations: {}
            };
            // Pre-load columns
            loadColumns(alias, targetId);
        }
        onChange(newValue);
    };

    const loadColumns = async (alias: string, targetId: string) => {
        if (tableColumns[alias]) return;
        const cols = await fetchColumns(targetId);
        setTableColumns(prev => ({ ...prev, [alias]: cols }));
    };

    const toggleField = (alias: string, fieldName: string) => {
        const currentRel = value[alias];
        if (!currentRel) return;

        const currentFields = currentRel.fields || [];
        const newFields = currentFields.includes(fieldName)
            ? currentFields.filter((f: string) => f !== fieldName)
            : [...currentFields, fieldName];

        onChange({
            ...value,
            [alias]: { ...currentRel, fields: newFields }
        });
    };

    const handleNestedChange = (alias: string, subRelations: any) => {
        onChange({
            ...value,
            [alias]: { ...value[alias], relations: subRelations }
        });
    };

    if (depth >= 5) return null;

    return (
        <div className={cn("space-y-6", depth > 0 && "pl-6 border-l border-violet-500/10 mt-4")}>
            {/* 1. Selection Area: List of possible relation tables */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-muted-foreground lowercase">
                        {depth === 0 ? 'available relations' : `relations within ${label}`}
                    </p>
                    {depth > 0 && <Badge variant="outline" className="text-[10px] h-4">level {depth + 1}</Badge>}
                </div>
                
                {loading && <div className="flex items-center gap-2 text-xs italic opacity-50"><Icons.loading className="size-3 animate-spin"/> scanning...</div>}
                {!loading && relations.length === 0 && (
                    <p className="text-xs text-muted-foreground italic opacity-50">no further relations found.</p>
                )}

                <div className="flex flex-wrap gap-2">
                    {relations.map(rel => {
                        const alias = rel.alias || rel.target?.tableName || 'unknown';
                        const isActive = !!value[alias];
                        return (
                            <Button
                                key={rel.id}
                                type="button"
                                variant={isActive ? 'default' : 'secondary'}
                                size="sm"
                                onClick={() => toggleRelationActive(alias, String(rel.targetId))}
                                className="lowercase rounded-lg h-9 px-4 transition-all"
                            >
                                {isActive && <Icons.check className="size-3 mr-2" />}
                                {alias}
                            </Button>
                        );
                    })}
                </div>
            </div>

            {/* 2. Configuration Area: Active relations and their details */}
            <div className="space-y-4">
                {Object.entries(value).map(([alias, config]: [string, any]) => {
                    const relInfo = relations.find(r => (r.alias || r.target?.tableName) === alias);
                    if (!relInfo) return null;

                    return (
                        <div key={alias} className="p-4 rounded-2xl bg-muted/10 border border-border/5 animate-in fade-in slide-in-from-top-2 duration-300">
                           <div className="flex items-center justify-between mb-4 pb-4 border-b border-border/5">
                                <div className="flex items-center gap-3">
                                    <div className="size-8 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-600">
                                        <Icons.link className="size-4" />
                                    </div>
                                    <div>
                                        <p className="text-base font-medium lowercase leading-none mb-1">{alias}</p>
                                        <p className="text-xs text-muted-foreground lowercase">{relInfo.type.replace('_', ' ')} → {relInfo.target?.name}</p>
                                    </div>
                                </div>
                                <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => toggleRelationActive(alias, String(relInfo.targetId))}
                                    className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/5 h-8"
                                >
                                    disable
                                </Button>
                           </div>

                           {/* Columns Selection */}
                           <div className="space-y-3 mb-6">
                                <p className="text-[13px] text-muted-foreground lowercase font-medium">return these columns:</p>
                                <div className="flex flex-wrap gap-2">
                                    {(() => {
                                        // Trigger loading if not available
                                        if (!tableColumns[alias]) {
                                            loadColumns(alias, String(relInfo.targetId));
                                            return <p className="text-xs italic opacity-50">fetching schema...</p>;
                                        }

                                        const columns = tableColumns[alias] || [];
                                        return columns.map(col => {
                                            const isSelected = config.fields?.includes(col.name);
                                            return (
                                                <button
                                                    key={col.name}
                                                    type="button"
                                                    onClick={() => toggleField(alias, col.name)}
                                                    className={cn(
                                                        "px-3 py-1.5 rounded-lg text-xs transition-all flex items-center gap-1.5 border",
                                                        isSelected 
                                                            ? "bg-violet-500/10 text-violet-600 border-violet-500/20" 
                                                            : "bg-muted/20 text-muted-foreground border-transparent hover:bg-muted/30"
                                                    )}
                                                >
                                                    {isSelected && <Icons.check className="size-3" />}
                                                    {col.name}
                                                </button>
                                            );
                                        });
                                    })()}
                                </div>
                           </div>

                           {/* Nested Relations (RECURSIVE) */}
                           <RecursiveRelationPicker 
                                sourceId={relInfo.targetId}
                                depth={depth + 1}
                                value={config.relations || {}}
                                onChange={(nested) => handleNestedChange(alias, nested)}
                                label={alias}
                           />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
