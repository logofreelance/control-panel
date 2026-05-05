/**
 * database-schema/registry/column-types.ts
 * 
 * Column type definitions for schema builder
 * MIGRATED: Uses Lucide icons from @repo/config (no emoji)
 */

import { DataTypeIcons, type LucideIcon } from '../config/icons';

export interface ColumnType {
    value: string;
    label: string;
    Icon: LucideIcon;
    category: 'Primary' | 'Numeric' | 'String' | 'Date/Time' | 'Binary' | 'Advanced';
    isPrimaryKey?: boolean;
    requiresValues?: boolean;
    requiresTarget?: boolean;
    defaultLength?: number;
    defaultPrecision?: [number, number]; // [precision, scale]
    nativeForm?: string; // Standard SQL form, e.g. VARCHAR(255)
}

export const COLUMN_TYPES: ColumnType[] = [
    // Primary Identifiers
    { value: 'id', label: 'ID (Auto Increment)', Icon: DataTypeIcons.id, category: 'Primary', isPrimaryKey: true, nativeForm: 'INT(11) UNSIGNED' },
    { value: 'uuid', label: 'UUID (String 36)', Icon: DataTypeIcons.uuid, category: 'Primary', defaultLength: 36, nativeForm: 'CHAR(36)' },
    { value: 'relation', label: 'RELATION (FK)', Icon: DataTypeIcons.relation, category: 'Primary', requiresTarget: true, nativeForm: 'INT(11) UNSIGNED' },

    // Numeric Types
    { value: 'tinyint', label: 'TINYINT', Icon: DataTypeIcons.integer, category: 'Numeric', defaultLength: 4, nativeForm: 'TINYINT(4)' },
    { value: 'smallint', label: 'SMALLINT', Icon: DataTypeIcons.integer, category: 'Numeric', defaultLength: 6, nativeForm: 'SMALLINT(6)' },
    { value: 'mediumint', label: 'MEDIUMINT', Icon: DataTypeIcons.integer, category: 'Numeric', defaultLength: 9, nativeForm: 'MEDIUMINT(9)' },
    { value: 'integer', label: 'INT', Icon: DataTypeIcons.integer, category: 'Numeric', defaultLength: 11, nativeForm: 'INT(11)' },
    { value: 'bigint', label: 'BIGINT', Icon: DataTypeIcons.bigint, category: 'Numeric', defaultLength: 20, nativeForm: 'BIGINT(20)' },
    { value: 'decimal', label: 'DECIMAL(10,2)', Icon: DataTypeIcons.decimal, category: 'Numeric', defaultPrecision: [10, 2], nativeForm: 'DECIMAL(10,2)' },
    { value: 'float', label: 'FLOAT', Icon: DataTypeIcons.float, category: 'Numeric', nativeForm: 'FLOAT' },
    { value: 'double', label: 'DOUBLE', Icon: DataTypeIcons.float, category: 'Numeric', nativeForm: 'DOUBLE' },
    { value: 'bit', label: 'BIT', Icon: DataTypeIcons.boolean, category: 'Numeric', defaultLength: 1, nativeForm: 'BIT(1)' },

    // String Types
    { value: 'char', label: 'CHAR(n)', Icon: DataTypeIcons.string, category: 'String', defaultLength: 1, nativeForm: 'CHAR(1)' },
    { value: 'string', label: 'VARCHAR(255)', Icon: DataTypeIcons.string, category: 'String', defaultLength: 255, nativeForm: 'VARCHAR(255)' },
    { value: 'tinytext', label: 'TINYTEXT', Icon: DataTypeIcons.text, category: 'String', nativeForm: 'TINYTEXT' },
    { value: 'text', label: 'TEXT', Icon: DataTypeIcons.text, category: 'String', nativeForm: 'TEXT' },
    { value: 'mediumtext', label: 'MEDIUMTEXT', Icon: DataTypeIcons.text, category: 'String', nativeForm: 'MEDIUMTEXT' },
    { value: 'longtext', label: 'LONGTEXT', Icon: DataTypeIcons.text, category: 'String', nativeForm: 'LONGTEXT' },
    { value: 'slug', label: 'SLUG (VARCHAR)', Icon: DataTypeIcons.slug, category: 'String', defaultLength: 255, nativeForm: 'VARCHAR(255)' },
    { value: 'email', label: 'EMAIL (VARCHAR)', Icon: DataTypeIcons.email, category: 'String', defaultLength: 255, nativeForm: 'VARCHAR(255)' },
    { value: 'phone', label: 'PHONE (VARCHAR)', Icon: DataTypeIcons.phone, category: 'String', defaultLength: 32, nativeForm: 'VARCHAR(32)' },
    { value: 'url', label: 'URL (VARCHAR)', Icon: DataTypeIcons.url, category: 'String', defaultLength: 2048, nativeForm: 'VARCHAR(2048)' },

    // Date & Time Types
    { value: 'date', label: 'DATE', Icon: DataTypeIcons.date, category: 'Date/Time', nativeForm: 'DATE' },
    { value: 'time', label: 'TIME', Icon: DataTypeIcons.date, category: 'Date/Time', nativeForm: 'TIME' },
    { value: 'datetime', label: 'DATETIME', Icon: DataTypeIcons.datetime, category: 'Date/Time', nativeForm: 'DATETIME' },
    { value: 'timestamp', label: 'TIMESTAMP', Icon: DataTypeIcons.timestamp, category: 'Date/Time', nativeForm: 'TIMESTAMP' },
    { value: 'year', label: 'YEAR', Icon: DataTypeIcons.date, category: 'Date/Time', nativeForm: 'YEAR' },

    // Binary Types
    { value: 'binary', label: 'BINARY(n)', Icon: DataTypeIcons.json, category: 'Binary', defaultLength: 1, nativeForm: 'BINARY(1)' },
    { value: 'varbinary', label: 'VARBINARY(n)', Icon: DataTypeIcons.json, category: 'Binary', defaultLength: 255, nativeForm: 'VARBINARY(255)' },
    { value: 'tinyblob', label: 'TINYBLOB', Icon: DataTypeIcons.json, category: 'Binary', nativeForm: 'TINYBLOB' },
    { value: 'blob', label: 'BLOB', Icon: DataTypeIcons.json, category: 'Binary', nativeForm: 'BLOB' },
    { value: 'mediumblob', label: 'MEDIUMBLOB', Icon: DataTypeIcons.json, category: 'Binary', nativeForm: 'MEDIUMBLOB' },
    { value: 'longblob', label: 'LONGBLOB', Icon: DataTypeIcons.json, category: 'Binary', nativeForm: 'LONGBLOB' },
    { value: 'json', label: 'JSON', Icon: DataTypeIcons.json, category: 'Binary', nativeForm: 'JSON' },

    // Advanced Types
    { value: 'boolean', label: 'BOOLEAN (TINYINT)', Icon: DataTypeIcons.boolean, category: 'Advanced', nativeForm: 'TINYINT(1)' },
    { value: 'enum', label: 'ENUM(...)', Icon: DataTypeIcons.enum, category: 'Advanced', requiresValues: true, nativeForm: 'ENUM' },
    { value: 'set', label: 'SET(...)', Icon: DataTypeIcons.enum, category: 'Advanced', requiresValues: true, nativeForm: 'SET' },
    { value: 'status', label: 'STATUS (ENUM)', Icon: DataTypeIcons.status, category: 'Advanced', requiresValues: true, nativeForm: 'ENUM' },
    { value: 'image', label: 'IMAGE (VARCHAR)', Icon: DataTypeIcons.image, category: 'Advanced', defaultLength: 2048, nativeForm: 'VARCHAR(2048)' },
    { value: 'file', label: 'FILE (VARCHAR)', Icon: DataTypeIcons.file, category: 'Advanced', defaultLength: 2048, nativeForm: 'VARCHAR(2048)' },
];

export type ColumnTypeValue = typeof COLUMN_TYPES[number]['value'];

