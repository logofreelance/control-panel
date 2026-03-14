/**
 * @cp/config/database/column-types.ts
 * 
 * Column Type Definitions - Single Source of Truth
 * Used by both backend DDL builder and frontend UI
 * 
 * ICON VALUES: Use Lucide icon keys (NOT emoji)
 * These map to Lucide React components in frontend
 */

export interface ColumnTypeDefinition {
    /** SQL type template (use {{placeholder}} for dynamic values) */
    sql: string;
    /** Human-readable label */
    label: string;
    /** Lucide icon key (e.g., 'key', 'hash', 'type') */
    icon: string;
    /** Is this a primary key type? */
    isPrimaryKey?: boolean;
    /** Is this column editable in UI? */
    editable?: boolean;
    /** Default value for SQL (e.g., 'FALSE', 'CURRENT_TIMESTAMP') */
    default?: string;
    /** Does this type require values array? (for ENUM) */
    requiresValues?: boolean;
    /** Does this type require target table? (for relation) */
    requiresTarget?: boolean;
    /** Default placeholder values */
    defaults?: Record<string, number | string>;
    /** Validation rules */
    validation?: {
        min?: number;
        max?: number;
        maxLength?: number;
        pattern?: string;
        format?: string;
    };
    /** Is this column unique by default? */
    unique?: boolean;
}

/**
 * Complete Column Type Registry
 * 
 * Icon keys map to Lucide icons:
 * - key -> Key
 * - hash -> Hash
 * - type -> Type
 * - binary -> Binary
 * - etc.
 */
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

/**
 * Get list of column types for UI dropdowns
 */
export function getColumnTypeOptions(): Array<{ value: string; label: string; icon: string }> {
    return Object.entries(COLUMN_TYPES).map(([key, def]) => ({
        value: key,
        label: def.label,
        icon: def.icon,
    }));
}

/**
 * Check if a column type exists
 */
export function isValidColumnType(type: string): boolean {
    return type in COLUMN_TYPES;
}
