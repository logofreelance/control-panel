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
import { MODULE_LABELS } from '@/lib/config/client';
import { useRelations } from '../composables';
import { RELATION_TYPES } from '../registry';
import { FEATURE_ICONS as Icons } from '../constants';

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
    const relationId = deleteTarget.localKey || deleteTarget.alias || deleteTarget.target?.name;
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

      {/* Relations Grid */}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {relations.map((rel) => {
            return (
              <Card
                key={rel.id}
                className="group relative flex flex-col p-5 border-border shadow-none"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="size-12 rounded-xl bg-muted flex items-center justify-center text-2xl">
                    {getTypeIcon(rel.type)}
                  </div>
                  <div className="flex-1">
                    <TextHeading size="h5" className="font-semibold lowercase leading-none mb-1.5">
                      {getTypeLabel(rel.type)}
                    </TextHeading>
                    <p className="text-base text-muted-foreground font-normal lowercase">
                      relationship type
                    </p>
                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-9"
                      onClick={() => {
                        if (rel.localKey) {
                          const key = rel.localKey;
                          const path = nodeId
                            ? `/target/${nodeId}/database-schema/${DatabaseTableId}/relations/${key}/edit`
                            : `/database-schema/${DatabaseTableId}/relations/${key}/edit`;
                          router.push(path);
                        }
                      }}
                    >
                      <Icons.edit className="size-4 text-muted-foreground" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-9 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(rel);
                      }}
                    >
                      <Icons.trash className="size-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col gap-3 p-4 rounded-xl bg-muted/30 border border-border mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="block text-sm text-muted-foreground font-normal lowercase mb-0.5">
                        source
                      </span>
                      <span className="block text-base md:text-lg font-normal lowercase">
                        {DatabaseTableName}
                      </span>
                    </div>
                    <Icons.arrowRight className="size-5 text-muted-foreground" />
                    <div className="text-right">
                      <span className="block text-sm text-muted-foreground font-normal lowercase mb-0.5">
                        target
                      </span>
                      <span className="block text-base md:text-lg font-normal lowercase">
                        {rel.target?.name || 'unknown'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant="outline"
                    className="text-sm px-2.5 py-0.5 font-normal lowercase border-border flex gap-2 items-center"
                  >
                    <Icons.key className="size-3.5 text-muted-foreground" />
                    <span>{rel.localKey}</span>
                  </Badge>
                  {rel.alias && (
                    <Badge
                      variant="secondary"
                      className="text-sm px-2.5 py-0.5 font-normal lowercase"
                    >
                      <Icons.code className="size-3.5 mr-2" />
                      <span>{rel.alias}</span>
                    </Badge>
                  )}
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
