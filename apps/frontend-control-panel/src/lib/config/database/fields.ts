// packages/config/src/database/fields.ts
// Database field configuration

/**
 * Standard field lengths
 */
export const FIELD_LENGTH = {
    /** Standard name fields (usernames, display names, etc.) */
    NAME: 255,

    /** Email addresses */
    EMAIL: 255,

    /** URLs */
    URL: 500,

    /** Short descriptions */
    DESCRIPTION: 1000,

    /** Slugs and identifiers */
    SLUG: 100,

    /** Short text (e.g., status, method) */
    SHORT: 50,

    /** Color codes (e.g., #FFFFFF) */
    COLOR: 20,

    /** IP addresses (IPv4 and IPv6) */
    IP: 45,

    /** HTTP methods */
    METHOD: 10,

    /** Phone numbers */
    PHONE: 20,

    /** Roles and permission names */
    ROLE: 50,
} as const;

/**
 * DDL building blocks
 */
export const DDL = {
    /** Standard primary key */
    PRIMARY_KEY: 'BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY',

    /** Created timestamp */
    CREATED_AT: 'timestamp DEFAULT CURRENT_TIMESTAMP',

    /** Updated timestamp */
    UPDATED_AT: 'timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',

    /** Default engine */
    ENGINE: 'ENGINE=InnoDB',
} as const;

/**
 * Helper: Build varchar definition
 */
export const varchar = (length: number, nullable = true, defaultVal?: string): string => {
    let sql = `varchar(${length})`;
    if (!nullable) sql += ' NOT NULL';
    if (defaultVal !== undefined) sql += ` DEFAULT '${defaultVal}'`;
    return sql;
};

/**
 * Helper: Build standard timestamp columns DDL
 */
export const timestampColumns = (): string => `
    \`created_at\` ${DDL.CREATED_AT},
    \`updated_at\` ${DDL.UPDATED_AT}
`;
