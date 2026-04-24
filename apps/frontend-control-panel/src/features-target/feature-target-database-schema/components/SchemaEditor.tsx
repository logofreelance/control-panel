'use client';

/**
 * SchemaEditor - Flat Luxury UI Refactor
 * Pure UI component for editing data source schema integrated with TargetLayout
 */

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Button,
  Badge,
  Card,
  CardContent,
  Alert,
  AlertTitle,
  AlertDescription,
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  PageTitle,
  TextHeading,
} from '@/components/ui';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/frontend-api';
import { API } from '../api/endpoints';
import { useToast, useConfig } from '@/modules/_core';
import { Icons, MODULE_LABELS } from '@/lib/config/client';
import { TargetLayout } from '@/components/layout/TargetLayout';
import { ColumnBuilder } from './ColumnBuilder';
import { useDatabaseSchema, useSchemaEditor } from '../composables';
import type { ColumnDefinition, DatabaseTable } from '../types';

interface SchemaEditorProps {
  DatabaseTableId: string | number;
}

export const SchemaEditor = ({ DatabaseTableId }: SchemaEditorProps) => {
  const router = useRouter();
  const params = useParams();
  const nodeId = params?.id as string;
  const { addToast } = useToast();
  const { api } = useConfig();
  const C = {
    actions: { save: 'save', cancel: 'cancel' },
    validation: { noChanges: 'no changes to save' },
    status: { loading: 'loading' },
  };

  // Data from composables
  const { fetchOne, update } = useDatabaseSchema();
  const { addColumn, dropColumn, loading: schemaLoading } = useSchemaEditor(DatabaseTableId);

  // Local state for UI
  const [source, setSource] = useState<DatabaseTable | null>(null);
  const [columns, setColumns] = useState<ColumnDefinition[]>([]);
  const [originalColumns, setOriginalColumns] = useState<ColumnDefinition[]>([]);
  const [saving, setSaving] = useState(false);

  // Compute available sources for relation picker
  const availableSources = useMemo(() => {
    // This could be fetched if needed, for now using a dummy or keeping it empty
    return [];
  }, []);

  // Detect changes
  const isDirty = useMemo(() => {
    return JSON.stringify(columns) !== JSON.stringify(originalColumns);
  }, [columns, originalColumns]);

  // Fetch source details
  useEffect(() => {
    const loadSource = async () => {
      const data = await fetchOne(DatabaseTableId);
      if (data) {
        setSource(data);

        // 1. Parse metadata for order and custom settings
        const metadataSchema = data.schemaJson ? JSON.parse(data.schemaJson) : { columns: [] };
        const metadataColumns: ColumnDefinition[] = metadataSchema.columns || [];

        // 2. Fetch physical columns from backend
        try {
          const res = await apiClient.get<any[]>(API.pageDataViewer.columns(String(DatabaseTableId)), {
            headers: nodeId ? { 'x-target-id': nodeId } : {},
          });
          
          if (res.status === 'success' && res.data) {
            // Map physical columns to our internal type
            const physicalCols: ColumnDefinition[] = res.data.map((pc: any) => {
              const type = pc.type.toLowerCase();
              let mappedType = 'string';

              if (type.includes('int')) mappedType = 'integer';
              else if (type.includes('decimal')) mappedType = 'decimal';
              else if (type.includes('float') || type.includes('double')) mappedType = 'float';
              else if (type.includes('text') || type.includes('longtext')) mappedType = 'text';
              else if (type.includes('json')) mappedType = 'json';
              else if (type.includes('bool') || type === 'tinyint(1)') mappedType = 'boolean';
              else if (type.includes('timestamp')) mappedType = 'timestamp';
              else if (type.includes('datetime')) mappedType = 'datetime';
              else if (type.includes('date')) mappedType = 'date';

              return {
                name: pc.name,
                type: mappedType,
                required: !pc.nullable,
                unique: pc.isPrimary,
              };
            });

            // 3. Merge: Order physical columns based on metadata
            const orderedCols: ColumnDefinition[] = [];
            const physicalMap = new Map(physicalCols.map(c => [c.name, c]));

            // First, add columns that exist in both metadata and physical DB (respect metadata order)
            for (const metaCol of metadataColumns) {
              const physicalMatch = physicalMap.get(metaCol.name);
              if (physicalMatch) {
                orderedCols.push({
                  ...metaCol, // Priority: metadata (custom types/labels)
                  required: physicalMatch.required, // Truth: physical DB
                  unique: physicalMatch.unique, // Truth: physical DB
                });
                physicalMap.delete(metaCol.name);
              }
            }

            // Then, add any physical columns that are NOT in metadata (appended to end)
            for (const physCol of physicalMap.values()) {
              orderedCols.push(physCol);
            }

            setColumns(orderedCols);
            setOriginalColumns(JSON.parse(JSON.stringify(orderedCols)));
          } else {
            // Fallback to pure schemaJson if physical fetch fails
            setColumns(metadataColumns);
            setOriginalColumns(JSON.parse(JSON.stringify(metadataColumns)));
          }
        } catch (e) {
          // Fallback on error
          setColumns(metadataColumns);
          setOriginalColumns(JSON.parse(JSON.stringify(metadataColumns)));
        }
      }
    };

    if (DatabaseTableId) loadSource();
  }, [DatabaseTableId, fetchOne, api]);

  const handleSave = async () => {
    if (!isDirty) {
      addToast(C.validation.noChanges || 'No changes to save', 'info');
      return;
    }

    setSaving(true);
    const originalMap = new Map(originalColumns.map((c) => [c.name, c]));
    const newMap = new Map(columns.map((c) => [c.name, c]));

    const toAdd: ColumnDefinition[] = [];
    const toDrop: string[] = [];

    for (const col of columns) if (!originalMap.has(col.name)) toAdd.push(col);
    for (const orgCol of originalColumns) if (!newMap.has(orgCol.name)) toDrop.push(orgCol.name);

    let hasError = false;
    try {
      // 1. Sync physical columns (Add/Drop)
      for (const colName of toDrop) {
        if (!(await dropColumn(colName))) hasError = true;
      }
      for (const col of toAdd) {
        if (!(await addColumn(col))) hasError = true;
      }

      // 2. Persist entire schema metadata (including order)
      if (!hasError) {
        const res = await update(DatabaseTableId, {
          schemaJson: JSON.stringify({ columns }),
        });
        if (!res) hasError = true;
      }
    } catch (e) {
      hasError = true;
    }

    if (!hasError) {
      setOriginalColumns(JSON.parse(JSON.stringify(columns)));
      addToast('schema updated successfully', 'success');
    }
    setSaving(false);
  };

  return (
    <TargetLayout>
      <div className="flex flex-col gap-4 animate-page-enter max-w-5xl mx-auto pb-6">
        {/* Header Section */}
        <header className="flex flex-col gap-4 px-1">
          <div className="flex items-start">
            <Button variant="ghost" onClick={() => router.back()}>
              <Icons.arrowLeft className="size-5 mr-3" />
              back to database list
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <PageTitle
              title={source?.name || ''}
              subtitle={
                <div className="flex items-center gap-2">
                  editing table structure for{' '}
                  <Badge variant="secondary" className="font-normal lowercase">
                    {source?.tableName}
                  </Badge>
                </div>
              }
            />
          </div>
        </header>

        {/* Column Definition Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 px-1">
            <Icons.config className="size-5 text-muted-foreground/40" />
            <p className="text-lg font-normal text-muted-foreground lowercase">
              structure definition
            </p>
          </div>
          <ColumnBuilder
            columns={columns}
            onChange={setColumns}
            availableSources={availableSources}
          />
        </div>

        {/* Action Bar */}
        <Card>
          <div className="px-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'size-2 rounded-full',
                  isDirty ? 'bg-primary animate-pulse' : 'bg-muted-foreground/20',
                )}
              />
              <span className="text-base font-normal text-muted-foreground lowercase">
                {isDirty ? 'unsaved changes detected' : 'schema is up to date'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={handleSave}
                isLoading={saving || schemaLoading}
                disabled={!isDirty}
                size="default"
              >
                <Icons.save className="size-4 mr-2" />
                {C.actions.save} changes
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </TargetLayout>
  );
};
