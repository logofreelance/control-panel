'use client';

/**
 * ColumnBuilder - Flat Luxury UI Refactor
 * Defined columns for database schema with consistent design system
 */

import { useState } from 'react';
import {
  Button,
  Input,
  Card,
  CardContent,
  Select,
  Checkbox,
  Label,
  Badge,
  Field,
  FieldLabel,
} from '@/components/ui';
import { TextHeading } from '@/components/ui/text-heading';
import { useConfig } from '@/modules/_core';
import { cn } from '@/lib/utils';
import { COLUMN_TYPES } from '../registry';
import { ColumnDefinition } from '../types';

interface ColumnBuilderProps {
  columns: ColumnDefinition[];
  onChange: (columns: ColumnDefinition[]) => void;
  availableSources?: { label: string; value: string }[];
}

export const ColumnBuilder = ({ columns, onChange, availableSources = [] }: ColumnBuilderProps) => {
  const { icons: Icons, labels } = useConfig();
  const L = labels.mod.databaseSchema;
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  const addColumn = () => {
    onChange([...columns, { name: '', type: 'string' }]);
  };

  const updateColumn = (
    index: number,
    field: keyof ColumnDefinition,
    value: ColumnDefinition[keyof ColumnDefinition],
  ) => {
    const updated = [...columns];
    updated[index] = { ...updated[index], [field]: value };

    if (field === 'type' && value !== 'relation' && updated[index].target) {
      delete updated[index].target;
    }

    onChange(updated);
  };

  const removeColumn = (index: number) => {
    onChange(columns.filter((_, i) => i !== index));
  };

  const moveColumn = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= columns.length) return;

    const updated = [...columns];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    onChange(updated);
  };

  const getTypeInfo = (type: string) => COLUMN_TYPES.find((t) => t.value === type);

  return (
    <div className="space-y-4">
      {columns.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center text-center py-24 border border-dashed rounded-xl cursor-pointer hover:bg-muted/5 transition-all gap-4"
          onClick={addColumn}
        >
          <Icons.sparkles className="size-12 opacity-20" />
          <div className="space-y-1">
            <TextHeading size="h6" weight="semibold">
              {L.forms.startBuildingSchema}
            </TextHeading>
            <p className="text-muted-foreground">{L.forms.addColumnsToDefine}</p>
          </div>
          <Button type="button">{L.forms.addFirstColumn}</Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {columns.map((col, index) => {
            const typeInfo = getTypeInfo(col.type);
            const isFocused = focusedIndex === index;

            return (
              <Card
                key={index}
                onFocus={() => setFocusedIndex(index)}
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget)) {
                    setFocusedIndex(null);
                  }
                }}
              >
                <CardContent className="">
                  <div className="flex flex-col md:flex-row gap-3 md:items-start">
                    <div className="flex items-center justify-between md:flex-col gap-4">
                      <div className="p-3 bg-muted text-muted-foreground rounded-xl">
                        {typeInfo?.Icon ? (
                          <typeInfo.Icon className="size-6" />
                        ) : (
                          <Icons.fileText className="size-6" />
                        )}
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => moveColumn(index, 'up')}
                          disabled={index === 0}
                          className="size-8"
                        >
                          <Icons.chevronUp className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => moveColumn(index, 'down')}
                          disabled={index === columns.length - 1}
                          className="size-8"
                        >
                          <Icons.chevronDown className="size-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex-1 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-x-4 gap-y-3">
                        <div className="md:col-span-4">
                          <Input
                            label="column name"
                            value={col.name}
                            onChange={(e) =>
                              updateColumn(
                                index,
                                'name',
                                e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''),
                              )
                            }
                            placeholder="e.g. user_id"
                          />
                        </div>

                        <Field className="md:col-span-4">
                          <FieldLabel>data type</FieldLabel>
                          <Select
                            value={col.type}
                            onChange={(e) => updateColumn(index, 'type', e.target.value)}
                            fullWidth
                            options={COLUMN_TYPES.map((t) => ({
                              label: t.label.toLowerCase(),
                              value: t.value,
                            }))}
                          />
                        </Field>

                        <div className="md:col-span-4 flex items-end gap-5 pb-1">
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id={`required-${index}`}
                              checked={!!col.required}
                              onCheckedChange={(val: boolean) =>
                                updateColumn(index, 'required', val)
                              }
                            />
                            <Label htmlFor={`required-${index}`} className="lowercase font-normal">
                              required
                            </Label>
                          </div>

                          <div className="flex items-center gap-2">
                            <Checkbox
                              id={`unique-${index}`}
                              checked={!!col.unique}
                              onCheckedChange={(val: boolean) => updateColumn(index, 'unique', val)}
                            />
                            <Label htmlFor={`unique-${index}`} className="lowercase font-normal">
                              unique
                            </Label>
                          </div>
                        </div>
                      </div>

                      {(typeInfo?.requiresValues ||
                        typeInfo?.requiresTarget ||
                        col.type === 'string') && (
                        <div className="pt-1">
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-x-4 gap-y-3">
                            {typeInfo?.requiresValues && (
                              <div className="md:col-span-8">
                                <Input
                                  label={L.forms.allowedValues}
                                  value={(col.values || []).join(', ')}
                                  onChange={(e) =>
                                    updateColumn(
                                      index,
                                      'values',
                                      e.target.value
                                        .split(',')
                                        .map((v) => v.trim())
                                        .filter(Boolean),
                                    )
                                  }
                                  placeholder="e.g. active, pending, archive"
                                />
                              </div>
                            )}

                            {typeInfo?.requiresTarget && (
                              <div className="md:col-span-4">
                                <Field>
                                  <FieldLabel>{L.forms.targetTable}</FieldLabel>
                                  <Select
                                    value={col.target || ''}
                                    onChange={(e) => updateColumn(index, 'target', e.target.value)}
                                    fullWidth
                                    options={[
                                      { label: 'Select target table...', value: '' },
                                      ...availableSources.map((s) => ({
                                        label: s.label,
                                        value: s.value,
                                      })),
                                    ]}
                                  />
                                </Field>
                              </div>
                            )}

                            {col.type === 'string' && (
                              <div className="md:col-span-2">
                                <Input
                                  label="length"
                                  type="number"
                                  value={col.length || 255}
                                  onChange={(e) =>
                                    updateColumn(index, 'length', parseInt(e.target.value) || 255)
                                  }
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border/30 flex items-center justify-between gap-4">
                    <p className="text-sm text-muted-foreground italic">
                      {col.type === 'slug' && L.forms.slugHint}
                      {col.type === 'string' && L.forms.stringHint}
                      {col.type === 'relation' && L.forms.relationHint}
                    </p>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => removeColumn(index)}
                    >
                      <Icons.trash className="size-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          <div className="pt-2">
            <Button type="button" variant="default" onClick={addColumn}>
              <Icons.plus className="size-4 mr-2" />
              <span>{L.forms.addColumn.toLowerCase()}</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
