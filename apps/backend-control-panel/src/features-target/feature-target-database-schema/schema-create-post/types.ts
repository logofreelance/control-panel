/**
 * schema-create-post/types.ts
 *
 * Types ONLY for schema creation
 */

export interface ColumnDefinition {
  name: string;
  type: string;
  required?: boolean;
  unique?: boolean;
  length?: number;
  values?: string[];
  target?: string;
  isPrimary?: boolean;
  nullable?: boolean;
  default?: any;
}

export interface SchemaDefinition {
  columns: ColumnDefinition[];
  timestamps?: boolean;
  softDelete?: boolean;
}
