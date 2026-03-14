/**
 * data-sources/registry/column-types.ts
 * 
 * Column type definitions for schema builder
 * MIGRATED: Uses Lucide icons from @cp/config (no emoji)
 */

import { DataTypeIcons, type LucideIcon } from '@cp/config/client';

export interface ColumnType {
    value: string;
    label: string;
    Icon: LucideIcon;
    isPrimaryKey?: boolean;
    requiresValues?: boolean;
    requiresTarget?: boolean;
}

export const COLUMN_TYPES: ColumnType[] = [
    { value: 'id', label: 'Auto ID', Icon: DataTypeIcons.id, isPrimaryKey: true },
    { value: 'uuid', label: 'UUID', Icon: DataTypeIcons.uuid },
    { value: 'integer', label: 'Integer', Icon: DataTypeIcons.integer },
    { value: 'bigint', label: 'Big Integer', Icon: DataTypeIcons.bigint },
    { value: 'decimal', label: 'Decimal', Icon: DataTypeIcons.decimal },
    { value: 'float', label: 'Float', Icon: DataTypeIcons.float },
    { value: 'string', label: 'Short Text', Icon: DataTypeIcons.string },
    { value: 'text', label: 'Long Text', Icon: DataTypeIcons.text },
    { value: 'slug', label: 'URL Slug', Icon: DataTypeIcons.slug },
    { value: 'email', label: 'Email', Icon: DataTypeIcons.email },
    { value: 'phone', label: 'Phone', Icon: DataTypeIcons.phone },
    { value: 'url', label: 'URL', Icon: DataTypeIcons.url },
    { value: 'date', label: 'Date', Icon: DataTypeIcons.date },
    { value: 'datetime', label: 'Date & Time', Icon: DataTypeIcons.datetime },
    { value: 'timestamp', label: 'Timestamp', Icon: DataTypeIcons.timestamp },
    { value: 'boolean', label: 'Yes/No', Icon: DataTypeIcons.boolean },
    { value: 'json', label: 'JSON Object', Icon: DataTypeIcons.json },
    { value: 'enum', label: 'Select Options', Icon: DataTypeIcons.enum, requiresValues: true },
    { value: 'status', label: 'Status', Icon: DataTypeIcons.status },
    { value: 'relation', label: 'Relation', Icon: DataTypeIcons.relation, requiresTarget: true },
    { value: 'image', label: 'Image URL', Icon: DataTypeIcons.image },
    { value: 'file', label: 'File URL', Icon: DataTypeIcons.file },
];

export type ColumnTypeValue = typeof COLUMN_TYPES[number]['value'];

