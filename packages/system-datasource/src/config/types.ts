/**
 * packages/system-datasource/src/config/types.ts
 * 
 * Column Type Definitions - Internalized for Strict Isolation
 */

export interface ColumnTypeDefinition {
    sql: string;
    label: string;
    icon: string;
    isPrimaryKey?: boolean;
    editable?: boolean;
    default?: string;
    requiresValues?: boolean;
    requiresTarget?: boolean;
    defaults?: Record<string, number | string>;
    validation?: {
        min?: number;
        max?: number;
        maxLength?: number;
        pattern?: string;
        format?: string;
    };
    unique?: boolean;
}

export const COLUMN_TYPES: Record<string, ColumnTypeDefinition> = {
    // ===== AUTO =====
    id: {
        sql: 'BIGINT UNSIGNED NOT NULL AUTO_INCREMENT',
        label: 'Auto ID',
        icon: 'key',
        isPrimaryKey: true,
        editable: false
    },
    uuid: {
        sql: 'CHAR(36)',
        label: 'UUID',
        icon: 'fingerprint',
        default: 'UUID()'
    },

    // ===== NUMERIC =====
    integer: {
        sql: 'INT',
        label: 'Integer',
        icon: 'hash',
        validation: { min: -2147483648, max: 2147483647 }
    },
    bigint: {
        sql: 'BIGINT',
        label: 'Big Integer',
        icon: 'hash'
    },
    decimal: {
        sql: 'DECIMAL({{precision}},{{scale}})',
        label: 'Decimal',
        icon: 'coins',
        defaults: { precision: 10, scale: 2 }
    },
    float: {
        sql: 'FLOAT',
        label: 'Float',
        icon: 'percent'
    },

    // ===== STRING =====
    string: {
        sql: 'VARCHAR({{length}})',
        label: 'Short Text',
        icon: 'type',
        defaults: { length: 255 },
        validation: { maxLength: 255 }
    },
    text: {
        sql: 'TEXT',
        label: 'Long Text',
        icon: 'fileText'
    },
    slug: {
        sql: 'VARCHAR(255)',
        label: 'URL Slug',
        icon: 'link',
        validation: { pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$' },
        unique: true
    },
    email: {
        sql: 'VARCHAR(255)',
        label: 'Email',
        icon: 'mail',
        validation: { format: 'email' }
    },
    phone: {
        sql: 'VARCHAR(20)',
        label: 'Phone',
        icon: 'phone',
        validation: { pattern: '^[+0-9-() ]+$' }
    },
    url: {
        sql: 'VARCHAR(2000)',
        label: 'URL',
        icon: 'globe',
        validation: { format: 'url' }
    },

    // ===== DATE/TIME =====
    date: {
        sql: 'DATE',
        label: 'Date',
        icon: 'calendar'
    },
    datetime: {
        sql: 'DATETIME',
        label: 'Date & Time',
        icon: 'calendarClock'
    },
    timestamp: {
        sql: 'TIMESTAMP',
        label: 'Timestamp',
        icon: 'clock'
    },

    // ===== BOOLEAN =====
    boolean: {
        sql: 'BOOLEAN',
        label: 'Yes/No',
        icon: 'toggleLeft',
        default: 'FALSE'
    },

    // ===== JSON =====
    json: {
        sql: 'JSON',
        label: 'JSON Object',
        icon: 'braces'
    },

    // ===== ENUMS =====
    enum: {
        sql: 'ENUM({{values}})',
        label: 'Select Options',
        icon: 'list',
        requiresValues: true
    },
    status: {
        sql: "ENUM('draft','active','archived')",
        label: 'Status',
        icon: 'circleEllipsis',
        default: "'draft'"
    },

    // ===== RELATIONS =====
    relation: {
        sql: 'BIGINT UNSIGNED',
        label: 'Relation',
        icon: 'link2',
        requiresTarget: true
    },

    // ===== MEDIA =====
    image: {
        sql: 'VARCHAR(500)',
        label: 'Image URL',
        icon: 'image',
        validation: { format: 'url' }
    },
    file: {
        sql: 'VARCHAR(500)',
        label: 'File URL',
        icon: 'paperclip',
        validation: { format: 'url' }
    }
} as const;

export const VALIDATION_TYPES = {
    REQUIRED: 'required',
    MIN: 'min',
    MAX: 'max',
    MIN_LENGTH: 'minLength',
    MAX_LENGTH: 'maxLength',
    PATTERN: 'pattern',
    FORMAT: 'format',
    IN: 'in',
} as const;
