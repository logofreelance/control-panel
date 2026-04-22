'use client';

/**
 * ResourceForm - Enhanced with Flat Luxury UI
 * Integrated with TargetLayout and consistent Design System
 */

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Button,
  Select,
  Card,
  CardContent,
  Badge,
  Input,
  Label,
  TextHeading,
  Checkbox,
  Switch,
} from '@/components/ui';
import { cn } from '@/lib/utils';
import { Icons, MODULE_LABELS } from '@/lib/config/client';
import { useResourceSubmit, useRelations } from '../composables';
import { RecursiveRelationPicker } from './RecursiveRelationPicker';
import { useConfig } from '@/modules/_core';
import type { DatabaseTable, Resource } from '../types';

const L = MODULE_LABELS.databaseSchema;
interface ResourceFormProps {
  DatabaseTable: DatabaseTable;
  resource?: Resource;
}

// Parse JSON safely
const safeParseJSON = <T,>(json: string | undefined | null, fallback: T): T => {
  if (!json) return fallback;
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
};

interface FormState {
  name: string;
  slug: string;
  description: string;
  fields: string[];
  orderBy: string;
  orderDirection: 'ASC' | 'DESC';
  limit: number;
  isPublic: boolean;
  aggregates?: {
    function: 'COUNT' | 'SUM' | 'AVG' | 'MIN' | 'MAX';
    column: string;
    alias?: string;
  }[];
  computed?: { name: string; expression: string }[];
  filters?: {
    field?: string;
    operator?: string;
    value?: string | string[];
    logic?: 'AND' | 'OR';
  }[];
  joins?: { table: string; alias: string; type: 'LEFT' | 'INNER'; on: [string, string] }[];
  relations?: any; // Tree structure: { [alias]: { targetId, fields, relations } }
}

export const ResourceForm = ({ DatabaseTable, resource }: ResourceFormProps) => {
  const router = useRouter();
  const params = useParams();
  const nodeId = params.id as string;

  // ✅ Pure DI: Get all dependencies from context
  const { labels, icons: Icons, defaults } = useConfig();
  const C = labels.common;

  // All data operations from composable
  const { submitting, create, update, fetchAvailableSources } = useResourceSubmit(DatabaseTable.id);

  // Relations Hook
  const { relations, loading: loadingRelations, fetchRelations } = useRelations(DatabaseTable.id);

  // Available sources for joins (fetched via composable)
  const [availableSources, setAvailableSources] = useState<DatabaseTable[]>([]);

  useEffect(() => {
    fetchAvailableSources(DatabaseTable.id).then(setAvailableSources);
    fetchRelations();
  }, [DatabaseTable.id, fetchAvailableSources, fetchRelations]);

  // Form State (UI only)
  const [form, setForm] = useState<FormState>({
    name: resource?.name || '',
    slug: resource?.slug || '',
    description: resource?.description || '',
    fields: safeParseJSON(resource?.fieldsJson, []),
    orderBy: resource?.orderBy || defaults.databaseSchema.resourceForm.orderBy,
    orderDirection: resource?.orderDirection || defaults.databaseSchema.resourceForm.orderDirection,
    limit: resource?.defaultLimit || defaults.databaseSchema.resourceForm.defaultLimit,
    isPublic: resource?.isPublic || defaults.databaseSchema.resourceForm.isPublic,
    aggregates: safeParseJSON(resource?.aggregatesJson, []),
    computed: safeParseJSON(resource?.computedJson, []),
    filters: (() => {
      const f = safeParseJSON<Record<string, unknown> | null>(resource?.filtersJson, null);
      if (
        f &&
        typeof f === 'object' &&
        'logic' in f &&
        Array.isArray((f as Record<string, unknown>).filters)
      ) {
        return (f as { filters: FormState['filters'] }).filters;
      }
      return Array.isArray(f) ? (f as FormState['filters']) : [];
    })(),
    joins: safeParseJSON(resource?.joinsJson, []),
    relations: safeParseJSON(resource?.relationsJson, null),
  });

  const columns = (() => {
    // 0. Handle potential data wrapping from some API versions
    const raw = DatabaseTable as any;
    const data = raw.data || raw.result || raw;

    // 1. Direct array columns (enriched by detail handler with DESCRIBE data)
    if (Array.isArray(data.columns) && data.columns.length > 0) {
      // Normalize: ensure each column has { name, type }
      return data.columns.map((col: any) => ({
        name: col.name || col.Field || col.column_name || col.COLUMN_NAME,
        type: col.type || col.Type || col.column_type || col.DATA_TYPE || 'string',
      }));
    }

    // 2. Direct object schema with columns
    if (data.schema && typeof data.schema === 'object' && 'columns' in data.schema) {
      const schemaCols = (data.schema as any).columns || [];
      if (Array.isArray(schemaCols) && schemaCols.length > 0) {
        return schemaCols;
      }
    }

    // 3. Direct fields array
    if (Array.isArray(data.fields) && data.fields.length > 0) {
      return data.fields.map((col: any) => ({
        name: col.name || col.Field || col,
        type: col.type || 'string',
      }));
    }

    // 4. JSON String fallback (schemaJson / schema_json / schema as string)
    const jsonStr = data.schemaJson || 
                   data.schema_json || 
                   (typeof data.schema === 'string' ? data.schema : null);
                   
    if (jsonStr && jsonStr !== '{}') {
      const parsed = safeParseJSON<any>(jsonStr, {});
      const parsedCols = parsed?.columns || (Array.isArray(parsed) ? parsed : []);
      if (parsedCols.length > 0) {
        return parsedCols;
      }
    }

    return [];
  })();

  useEffect(() => {
    console.log('[ResourceForm] DatabaseTable Prop:', DatabaseTable);
    console.log('[ResourceForm] Derived Columns:', columns.length, columns.slice(0, 3));
  }, [columns.length]);

  // Auto-generate slug
  const handleNameChange = (val: string) => {
    const updates: Partial<typeof form> = { name: val };
    if (!resource && !form.slug && val) {
      updates.slug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }
    setForm((prev) => ({ ...prev, ...updates }));
  };

  const toggleField = (colName: string) => {
    setForm((prev) => {
      const exists = prev.fields.includes(colName);
      if (exists) return { ...prev, fields: prev.fields.filter((f) => f !== colName) };
      return { ...prev, fields: [...prev.fields, colName] };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      database_table_id: DatabaseTable.id,
      name: form.name,
      slug: form.slug,
      description: form.description,
      fields_json: JSON.stringify(form.fields),
      order_by: form.orderBy,
      order_direction: form.orderDirection,
      default_limit: form.limit,
      is_public: form.isPublic,
      aggregates_json: JSON.stringify(form.aggregates),
      computed_json: JSON.stringify(form.computed),
      filters_json: JSON.stringify({
        logic: 'AND',
        filters: form.filters,
      }),
      joins_json: JSON.stringify(form.joins),
      relations_json: JSON.stringify(form.relations),
    };

    const result = resource ? await update(resource.id, payload) : await create(payload);

    if (result) {
      const path = nodeId ? `/target/${nodeId}/database-schema` : '/database-schema';
      router.push(path);
      router.refresh();
    }
  };

  return (
    <>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section: Basic Info */}
          <Card>
            <CardContent>
              <div className="flex items-center gap-3 border-b border-border/5 pb-4 mb-2">
                <div className="size-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                  <Icons.edit className="size-5" />
                </div>
                <TextHeading size="h5">
                  {L.labels.basicInformation}
                </TextHeading>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>
                    {L.labels.internalName}
                  </Label>
                  <Input
                    value={form.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. published posts"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>
                    {L.labels.urlSlug}
                  </Label>
                  <Input
                    value={form.slug}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, ''),
                      })
                    }
                    placeholder="published-posts"
                    required
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label>
                    {L.forms.description}
                  </Label>
                  <Input
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder={L.forms.descriptionPlaceholder}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section: Fields */}
          <Card>
            <CardContent>
              <div className="flex items-center gap-3 border-b border-border/5 pb-4 mb-2">
                <div className="size-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                  <Icons.gem className="size-5" />
                </div>
                <div className="space-y-0.5">
                  <TextHeading size="h5">
                    {L.labels.responseFields}
                  </TextHeading>
                  <p className="text-base font-normal text-muted-foreground lowercase">
                    {L.labels.selectFieldsHint.toLowerCase()}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {columns.length === 0 && (
                  <p className="text-base font-normal text-muted-foreground lowercase">
                    {L.labels.noColumnsInSchema}
                  </p>
                )}
                {columns.map((col: any) => {
                  const isSelected = form.fields.length === 0 || form.fields.includes(col.name);
                  return (
                    <Button
                      key={col.name}
                      type="button"
                      variant={isSelected ? 'default' : 'secondary'}
                      onClick={() => toggleField(col.name)}
                    >
                      {isSelected && <Icons.check className="size-3" />}
                      {col.name}
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Section: Relations (Eager Loading) */}
          <Card>
            <CardContent>
              <div className="flex items-center gap-3 border-b border-border/5 pb-4 mb-2">
                <div className="size-10 rounded-2xl bg-violet-500/10 flex items-center justify-center text-violet-600">
                  <Icons.link className="size-5" />
                </div>
                <div className="space-y-0.5">
                  <TextHeading size="h5">
                    {L.labels.relatedData}
                  </TextHeading>
                  <p className="text-base font-normal text-muted-foreground lowercase">
                    {(L.labels.relatedDataHint || "include data from related tables (eager loading).").toLowerCase()}
                  </p>
                </div>
              </div>

              {form.relations === null ? (
                <div className="text-center py-12 px-4 bg-muted/20 rounded-3xl border border-dashed border-border/40 text-muted-foreground space-y-4">
                  <p className="text-base font-normal text-muted-foreground lowercase">
                    {L.labels.relatedDataHint || "include data from related tables (eager loading)."}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setForm({
                        ...form,
                        relations: {} // Initialize as object to show the picker
                      })
                    }
                  >
                    Enable
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <RecursiveRelationPicker 
                    sourceId={DatabaseTable.id}
                    value={form.relations || {}}
                    onChange={(val) => setForm({ ...form, relations: val })}
                  />
                  
                  <div className="flex justify-center pt-4 border-t border-border/5">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm"
                      className="text-rose-500 lowercase"
                      onClick={() => setForm({ ...form, relations: null })}
                    >
                      disable all relations
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>


          {/* Section: Computed Fields */}
          <Card>
            <CardContent>
              <div className="flex items-center gap-3 border-b border-border/5 pb-4 mb-2">
                <div className="size-10 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-600">
                  <Icons.lightning className="size-5" />
                </div>
                <div className="space-y-0.5">
                  <TextHeading size="h5">
                    {L.labels.computedFields}
                  </TextHeading>
                </div>
              </div>

              {!form.computed || form.computed.length === 0 ? (
                <div className="text-center py-12 px-4 bg-muted/20 rounded-3xl border border-dashed border-border/40 text-muted-foreground space-y-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setForm({ ...form, computed: [{ name: '', expression: '' }] })}
                  >
                    <Icons.plus className="size-3.5 mr-2" /> {L.labels.addComputedField}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 max-w-4xl mx-auto">
                  {form.computed.map((comp, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <Input
                        value={comp.expression}
                        placeholder="price * quantity"
                        onChange={(e) => {
                          const newComp = [...form.computed!];
                          newComp[idx].expression = e.target.value;
                          setForm({ ...form, computed: newComp });
                        }}
                      />
                      <Input
                        value={comp.name}
                        placeholder="total_amount"
                        onChange={(e) => {
                          const newComp = [...form.computed!];
                          newComp[idx].name = e.target.value;
                          setForm({ ...form, computed: newComp });
                        }}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          const newComp = form.computed!.filter((_, i) => i !== idx);
                          setForm({ ...form, computed: newComp });
                        }}
                      >
                        <Icons.close className="size-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() =>
                      setForm({
                        ...form,
                        computed: [...form.computed!, { name: '', expression: '' }],
                      })
                    }
                  >
                    <Icons.plus className="size-4 mr-2" /> {L.labels.addAnotherField}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section: Aggregates */}
          <Card>
            <CardContent>
              <div className="flex items-center gap-3 border-b border-border/5 pb-4 mb-2">
                <div className="size-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                  <Icons.chart className="size-5" />
                </div>
                <div className="space-y-0.5">
                  <TextHeading size="h5">
                    {L.labels.aggregates}
                  </TextHeading>
                </div>
              </div>

              {!form.aggregates || form.aggregates.length === 0 ? (
                <div className="text-center py-12 px-4 bg-muted/20 rounded-3xl border border-dashed border-border/40 text-muted-foreground space-y-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setForm({ ...form, aggregates: [{ function: 'COUNT', column: '*' }] })
                    }
                  >
                    <Icons.plus className="size-3.5 mr-2" /> {L.labels.addAggregate}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 max-w-4xl mx-auto">
                  {form.aggregates?.map((agg: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-4">
                      <Select
                        value={agg.function}
                        onChange={(e) => {
                          const newAggs = [...form.aggregates!];
                          newAggs[idx].function = e.target.value as any;
                          setForm({ ...form, aggregates: newAggs });
                        }}
                        options={[
                          { label: 'COUNT', value: 'COUNT' },
                          { label: 'SUM', value: 'SUM' },
                          { label: 'AVG', value: 'AVG' },
                          { label: 'MIN', value: 'MIN' },
                          { label: 'MAX', value: 'MAX' },
                        ]}
                      />
                      <Select
                        value={agg.column}
                        onChange={(e) => {
                          const newAggs = [...form.aggregates!];
                          newAggs[idx].column = e.target.value;
                          setForm({ ...form, aggregates: newAggs });
                        }}
                        options={[
                          { label: `* ALL`, value: '*' },
                          ...columns.map((c: any) => ({ label: c.name, value: c.name })),
                        ]}
                      />
                      <Input
                        value={agg.alias || ''}
                        placeholder="alias"
                        onChange={(e) => {
                          const newAggs = [...form.aggregates!];
                          newAggs[idx].alias = e.target.value;
                          setForm({ ...form, aggregates: newAggs });
                        }}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          const newAggs = form.aggregates!.filter((_, i) => i !== idx);
                          setForm({ ...form, aggregates: newAggs });
                        }}
                      >
                        <Icons.close className="size-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() =>
                      setForm({
                        ...form,
                        aggregates: [...form.aggregates!, { function: 'COUNT', column: '*' }],
                      })
                    }
                  >
                    <Icons.plus className="size-4 mr-2" /> {L.labels.addAnotherAggregate}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section: Relations (Joins) */}
          <Card>
            <CardContent>
              <div className="flex items-center gap-3 border-b border-border/5 pb-4 mb-2">
                <div className="size-10 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-600">
                  <Icons.link className="size-5" />
                </div>
                <div className="space-y-0.5">
                  <TextHeading size="h5">
                    {L.labels.relationsJoins}
                  </TextHeading>
                </div>
              </div>

              {!form.joins || form.joins.length === 0 ? (
                <div className="text-center py-12 px-4 bg-muted/20 rounded-3xl border border-dashed border-border/40 text-muted-foreground space-y-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setForm({
                        ...form,
                        joins: [
                          {
                            table: availableSources[0]?.tableName || '',
                            alias: '',
                            type: 'LEFT',
                            on: ['', 'id'],
                          },
                        ],
                      })
                    }
                    disabled={availableSources.length === 0}
                  >
                    <Icons.plus className="size-3.5 mr-2" /> {L.labels.addRelation}
                  </Button>
                </div>
              ) : (
                <div className="space-y-6 max-w-4xl mx-auto">
                  {form.joins.map((join: any, idx: number) => (
                    <div key={idx} className="space-y-3">
                      <Select
                        value={join.type}
                        onChange={(e) => {
                          const newJoins = [...form.joins!];
                          newJoins[idx].type = e.target.value as any;
                          setForm({ ...form, joins: newJoins });
                        }}
                        options={[
                          { label: 'LEFT JOIN', value: 'LEFT' },
                          { label: 'INNER JOIN', value: 'INNER' },
                        ]}
                      />
                      <Select
                        value={join.table}
                        onChange={(e) => {
                          const newJoins = [...form.joins!];
                          newJoins[idx].table = e.target.value;
                          setForm({ ...form, joins: newJoins });
                        }}
                        options={availableSources.map((s) => ({
                          label: `${s.name} (${s.tableName})`,
                          value: s.tableName,
                        }))}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          const newJoins = form.joins!.filter((_, i) => i !== idx);
                          setForm({ ...form, joins: newJoins });
                        }}
                      >
                        <Icons.delete className="size-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() =>
                      setForm({
                        ...form,
                        joins: [
                          ...form.joins!,
                          {
                            table: availableSources[0]?.tableName || '',
                            alias: '',
                            type: 'LEFT',
                            on: ['', 'id'],
                          },
                        ],
                      })
                    }
                  >
                    <Icons.plus className="size-4 mr-2" /> {L.labels.addRelation}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section: Default Filters */}
          <Card>
            <CardContent>
              <div className="flex items-center gap-3 border-b border-border/5 pb-4 mb-2">
                <div className="size-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                  <Icons.search className="size-5" />
                </div>
                <div className="space-y-0.5">
                  <TextHeading size="h5">
                    {L.labels.defaultFilters}
                  </TextHeading>
                </div>
              </div>

              {!form.filters || form.filters.length === 0 ? (
                <div className="text-center py-12 px-4 bg-muted/20 rounded-3xl border border-dashed border-border/40 text-muted-foreground space-y-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setForm({
                        ...form,
                        filters: [{ field: columns[0]?.name || '', operator: 'eq', value: '' }],
                      })
                    }
                  >
                    <Icons.plus className="size-3.5 mr-2" /> {L.labels.addFilter}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 max-w-4xl mx-auto">
                  {form.filters.map((filter: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-3">
                      <Select
                        value={filter.field}
                        onChange={(e) => {
                          const newFilters = [...form.filters!];
                          newFilters[idx].field = e.target.value;
                          setForm({ ...form, filters: newFilters });
                        }}
                        options={columns.map((c: any) => ({ label: c.name, value: c.name }))}
                      />
                      <Select
                        value={filter.operator}
                        onChange={(e) => {
                          const newFilters = [...form.filters!];
                          newFilters[idx].operator = e.target.value;
                          setForm({ ...form, filters: newFilters });
                        }}
                        options={[
                          { label: 'EQUALS (=)', value: 'eq' },
                          { label: 'NOT EQUAL (!=)', value: 'neq' },
                          { label: 'GREATER (>)', value: 'gt' },
                          { label: 'GREATER/EQ (>=)', value: 'gte' },
                          { label: 'LESS (<)', value: 'lt' },
                          { label: 'LESS/EQ (<=)', value: 'lte' },
                          { label: 'CONTAINS (LIKE)', value: 'like' },
                          { label: 'IN LIST (IN)', value: 'in' },
                          { label: 'IS NULL', value: 'null' },
                          { label: 'IS NOT NULL', value: 'notNull' },
                        ]}
                      />
                      <Input
                        value={filter.value?.toString() || ''}
                        onChange={(e) => {
                          const newFilters = [...form.filters!];
                          newFilters[idx].value = e.target.value;
                          setForm({ ...form, filters: newFilters });
                        }}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          const newFilters = form.filters!.filter((_, i) => i !== idx);
                          setForm({ ...form, filters: newFilters });
                        }}
                      >
                        <Icons.close className="size-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() =>
                      setForm({
                        ...form,
                        filters: [
                          ...form.filters!,
                          { field: columns[0]?.name || '', operator: 'eq', value: '' },
                        ],
                      })
                    }
                  >
                    <Icons.plus className="size-4 mr-2" /> {L.labels.addFilter}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section: Config */}
          <Card>
            <CardContent>
              <div className="flex items-center gap-3 border-b border-border/5 pb-4 mb-2">
                <div className="size-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <Icons.settings className="size-5" />
                </div>
                <TextHeading size="h5">
                  {L.labels.configuration}
                </TextHeading>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <Label>
                    {L.labels.defaultSortConfig}
                  </Label>
                  <div className="flex flex-col gap-3">
                    <Select
                      value={form.orderBy}
                      onChange={(e) => setForm({ ...form, orderBy: e.target.value })}
                      fullWidth
                      options={columns.map((c: any) => ({ label: c.name, value: c.name }))}
                    />
                    <div className="flex bg-muted/40 p-1 rounded-xl h-10 ring-1 ring-border/5">
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, orderDirection: 'ASC' })}
                        className={cn(
                          'flex-1 rounded-lg text-base font-normal transition-all',
                          form.orderDirection === 'ASC'
                            ? 'bg-background text-primary shadow-sm'
                            : 'text-muted-foreground/40 hover:text-muted-foreground',
                        )}
                      >
                        ASCENDING
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, orderDirection: 'DESC' })}
                        className={cn(
                          'flex-1 rounded-lg text-base font-normal transition-all',
                          form.orderDirection === 'DESC'
                            ? 'bg-background text-primary shadow-sm'
                            : 'text-muted-foreground/40 hover:text-muted-foreground',
                        )}
                      >
                        DESCENDING
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>
                    {L.labels.limitPerPage}
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    max={defaults.databaseSchema.resourceForm.maxLimit}
                    value={form.limit}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        limit:
                          parseInt(e.target.value) ||
                          defaults.databaseSchema.resourceForm.defaultLimit,
                      })
                    }
                  />
                </div>

                <div className="lg:col-span-1 space-y-4">
                  <div className="flex items-center justify-between p-1">
                    <Label>{L.labels.publicAccess}</Label>
                    <Switch
                      checked={form.isPublic}
                      onCheckedChange={(checked) => setForm({ ...form, isPublic: checked })}
                    />
                  </div>
                  <div className="space-y-1 p-1">
                    <TextHeading size="h6">
                      {form.isPublic ? 'public access' : 'protected access'}
                    </TextHeading>
                    <p className="text-base font-normal text-muted-foreground/60 lowercase leading-relaxed">
                      {form.isPublic
                        ? L.labels.publicAccessWarning.toLowerCase()
                        : L.labels.protectedAccessNote.toLowerCase()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Bar */}
          <Card>
            <CardContent>
              <div className="flex items-center justify-between gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => router.back()}
                >
                  {C.actions.cancel}
                </Button>

                <div className="flex items-center gap-4">
                  {resource && (
                    <Badge variant="secondary">
                      ID: {resource.id}
                    </Badge>
                  )}
                  <Button
                    onClick={handleSubmit}
                    size="lg"
                    isLoading={submitting}
                  >
                    {resource ? C.actions.saveChanges : L.buttons.createResource}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
    </>
  );
};
