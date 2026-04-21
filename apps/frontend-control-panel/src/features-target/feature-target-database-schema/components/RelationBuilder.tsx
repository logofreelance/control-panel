'use client';

/**
 * RelationBuilder - Flat Luxury UI Refactor
 * Component for managing data source relations with consistent design system
 */

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Spinner,
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
  Separator,
  TextHeading,
} from '@/components/ui';
import { cn } from '@/lib/utils';
import { ConfirmDialog } from '@/modules/_core';
import { Icons, MODULE_LABELS } from '@/lib/config/client';
import { useRelations } from '../composables';
import { RELATION_TYPES } from '../registry';

const L = MODULE_LABELS.databaseSchema;

interface RelationBuilderProps {
  DatabaseTableId: string | number;
  DatabaseTableName: string;
  onRelationsChange?: () => void;
}

export const RelationBuilder = ({
  DatabaseTableId,
  DatabaseTableName,
  onRelationsChange,
}: RelationBuilderProps) => {
  const router = useRouter();
  const params = useParams();

  const rawNodeId = Array.isArray(params.id) ? params.id[0] : params.id;
  const nodeId = rawNodeId;

  // All data operations from composable
  const { relations, loading, deleteRelation } = useRelations(DatabaseTableId);

  // UI-only state
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

  // Handle delete relation
  const handleDeleteRelation = async () => {
    if (!deleteTarget) return;
    const relationId = deleteTarget.id;
    if (!relationId) return;

    const success = await deleteRelation(relationId);
    if (success) {
      setDeleteTarget(null);
      onRelationsChange?.();
    }
  };

  const getTypeLabel = (type: string) =>
    RELATION_TYPES.find((t) => t.value === type)?.label || type;
  const getTypeIcon = (type: string) => RELATION_TYPES.find((t) => t.value === type)?.icon || '?';

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Page Section Heading */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
            <Icons.link className="size-5" />
          </div>
          <div>
            <TextHeading size="h5" className="font-semibold lowercase">
              database relations
            </TextHeading>
            <p className="text-base text-muted-foreground font-normal lowercase">
              define and manage how tables connect with each other
            </p>
          </div>
          <Badge variant="secondary" className="px-2 py-0.5 text-base font-normal">
            {relations.length}
          </Badge>
        </div>
      </div>

      {/* Relations List (Refactored from Grid to List) */}
      {relations.length === 0 ? (
        <Empty className="py-16 border-border bg-card">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Icons.linkOff className="size-8 text-muted-foreground" />
            </EmptyMedia>
            <EmptyTitle className="text-lg md:text-xl font-semibold lowercase">
              no relations defined
            </EmptyTitle>
            <EmptyDescription className="text-base text-muted-foreground font-normal lowercase">
              connect your tables to build advanced queries and data structures.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="flex flex-col gap-3">
          {relations.map((rel) => {
            return (
              <Card
                key={rel.id}
                className="group relative flex flex-col md:flex-row md:items-center justify-between p-3 border-border shadow-none gap-4"
              >
                {/* 1. Type Icon & Label */}
                <div className="flex items-center gap-4 min-w-[200px]">
                  <div className="size-10 rounded-xl bg-primary/5 flex items-center justify-center text-xl text-primary shrink-0 border border-primary/10">
                    {getTypeIcon(rel.type)}
                  </div>
                  <div>
                    <TextHeading size="h6" className="font-semibold lowercase leading-none mb-1">
                      {getTypeLabel(rel.type)}
                    </TextHeading>
                    <p className="text-[10px] text-muted-foreground font-normal lowercase opacity-60">
                      relationship type
                    </p>
                  </div>
                </div>

                {/* 2. Mapping Visualization (Compact) */}
                <div className="flex-1 flex items-center justify-center gap-4 px-4 border-x border-border/5">
                  <div className="text-right">
                    <span className="block text-[10px] text-muted-foreground font-normal lowercase opacity-60">source</span>
                    <span className="block text-sm font-medium lowercase truncate max-w-[120px]">{DatabaseTableName}</span>
                  </div>
                  <div className="size-7 rounded-full bg-muted/40 flex items-center justify-center">
                    <Icons.arrowRight className="size-3.5 text-muted-foreground" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-muted-foreground font-normal lowercase opacity-60">target</span>
                    <span className="block text-sm font-medium lowercase truncate max-w-[120px]">{rel.target?.name || 'unknown'}</span>
                  </div>
                </div>

                {/* 3. Keys & Aliases */}
                <div className="flex flex-wrap items-center gap-2 min-w-[180px]">
                  <Badge variant="outline" className="text-[10px] px-2 py-0 h-5 font-normal lowercase border-border/40 bg-muted/20 text-muted-foreground flex gap-1.5 items-center">
                    <Icons.key className="size-2.5" />
                    {rel.localKey}
                  </Badge>
                  {rel.alias && (
                    <Badge variant="outline" className="text-[10px] px-2 py-0 h-5 font-medium lowercase border-indigo-500/10 bg-indigo-500/5 text-indigo-600 flex gap-1.5 items-center">
                      <Icons.code className="size-2.5" />
                      {rel.alias}
                    </Badge>
                  )}
                </div>

                {/* 4. Persistent Actions */}
                <div className="flex items-center gap-1 shrink-0 border-l border-border/5 pl-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs font-medium lowercase px-3"
                    onClick={() => {
                        const path = nodeId
                        ? `/target/${nodeId}/database-schema/${DatabaseTableId}/relations/${rel.id}/edit`
                        : `/database-schema/${DatabaseTableId}/relations/${rel.id}/edit`;
                        router.push(path);
                    }}
                  >
                    <Icons.edit className="size-3 mr-2" />
                    edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="size-8 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/5"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteTarget(rel);
                    }}
                  >
                    <Icons.trash className="size-3.5" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteRelation}
        title="delete relation?"
        message={`are you sure you want to delete this relation "${deleteTarget?.target?.name}"?`.toLowerCase()}
        confirmText="delete"
        variant="danger"
      />
    </div>
  );
};

export default RelationBuilder;
