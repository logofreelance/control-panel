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
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
  SelectSeparator,
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

  const SMART_DEFAULTS: Record<string, string> = {
    tinyint: '0',
    smallint: '0',
    mediumint: '0',
    integer: '0',
    bigint: '0',
    decimal: '0.00',
    float: '0.0',
    double: '0.0',
    bit: 'b\'0\'',
    boolean: '0',
    char: '',
    string: '',
    tinytext: '',
    text: '',
    mediumtext: '',
    longtext: '',
    binary: '0x00',
    varbinary: '0x00',
    date: 'CURRENT_DATE',
    time: '00:00:00',
    year: '2024',
    timestamp: 'CURRENT_TIMESTAMP',
    datetime: 'CURRENT_TIMESTAMP',
    json: '{}',
    status: 'active',
    uuid: 'UUID()',
  };

  const updateColumn = (
    index: number,
    field: keyof ColumnDefinition,
    value: ColumnDefinition[keyof ColumnDefinition],
  ) => {
    const updated = [...columns];
    const currentCol = updated[index];
    
    // Apply the change
    updated[index] = { ...currentCol, [field]: value };

    // SMART DEFAULTS: If type changes, suggest values and apply native defaults
    if (field === 'type') {
      const type = value as string;
      const typeInfo = getTypeInfo(type);

      // Suggest default value if current is empty
      if ((currentCol.default === undefined || currentCol.default === '') && type in SMART_DEFAULTS) {
        updated[index].default = SMART_DEFAULTS[type];
      }

      // Apply default length if available in registry
      if (typeInfo?.defaultLength) {
        updated[index].length = typeInfo.defaultLength;
      }

      // Cleanup target if not a relation anymore
      if (type !== 'relation' && updated[index].target) {
        delete updated[index].target;
      }
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
                        <div className="md:col-span-3">
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

                        <Field className="md:col-span-3">
                          <FieldLabel>data type</FieldLabel>
                          <Select
                            value={col.type}
                            onValueChange={(val) => updateColumn(index, 'type', val)}
                          >
                            <SelectTrigger fullWidth size="default">
                                <SelectValue placeholder="Select data type...">
                                    {typeInfo ? (
                                        <div className="flex items-center gap-2">
                                            <typeInfo.Icon className="size-4 opacity-50" />
                                            <span>{typeInfo.label}</span>
                                        </div>
                                    ) : 'Select type...'}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {['Primary', 'Numeric', 'String', 'Date/Time', 'Binary', 'Advanced'].map((cat) => {
                                const typesInCat = COLUMN_TYPES.filter(t => t.category === cat);
                                if (typesInCat.length === 0) return null;
                                
                                return (
                                  <SelectGroup key={cat}>
                                    <SelectLabel className="bg-muted/30 px-3 py-1.5 font-bold text-[10px] uppercase tracking-wider text-muted-foreground/70">
                                      {cat}
                                    </SelectLabel>
                                    {typesInCat.map((t) => (
                                      <SelectItem key={t.value} value={t.value} className="pl-6">
                                        <div className="flex items-center gap-3">
                                          <t.Icon className="size-4 opacity-50" />
                                          <div className="flex flex-col">
                                            <span className="font-normal">{t.label}</span>
                                            {t.nativeForm && (
                                              <span className="text-[10px] font-mono opacity-40 leading-none">
                                                {t.nativeForm}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </SelectItem>
                                    ))}
                                    <SelectSeparator className="opacity-30" />
                                  </SelectGroup>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </Field>

                        <div className="md:col-span-3">
                          <Input
                            label="default value"
                            value={col.default === undefined ? '' : String(col.default)}
                            onChange={(e) => updateColumn(index, 'default', e.target.value)}
                            placeholder={SMART_DEFAULTS[col.type] !== undefined ? `e.g. ${SMART_DEFAULTS[col.type]}` : "e.g. active"}
                          />
                        </div>

                        <div className="md:col-span-3 flex items-end gap-5 pb-1">
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
                                        .map((v) => v.trimStart())
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

                            {(typeInfo?.defaultLength || col.type === 'string') && (
                              <div className="md:col-span-2">
                                <Input
                                  label="length"
                                  type="number"
                                  value={col.length || typeInfo?.defaultLength || 255}
                                  onChange={(e) =>
                                    updateColumn(index, 'length', parseInt(e.target.value) || 0)
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
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-[10px] uppercase opacity-70">
                        {typeInfo?.nativeForm || col.type}
                      </Badge>
                      <p className="text-sm text-muted-foreground italic">
                        {col.type === 'slug' && L.forms.slugHint}
                        {col.type === 'string' && L.forms.stringHint}
                        {col.type === 'relation' && L.forms.relationHint}
                      </p>
                    </div>

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
