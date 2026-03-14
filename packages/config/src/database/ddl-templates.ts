/**
 * @cp/config/database/ddl-templates.ts
 * 
 * DDL SQL Templates - Single Source of Truth
 * Used by backend DDL builder
 * 
 * Use {{placeholder}} syntax for dynamic values
 */

// ============================================
// TABLE OPTIONS
// ============================================
export const TABLE_ENGINE = 'InnoDB';
export const TABLE_CHARSET = 'utf8mb4';
export const TABLE_COLLATE = 'utf8mb4_unicode_ci';

export const TABLE_OPTIONS = `ENGINE=${TABLE_ENGINE} DEFAULT CHARSET=${TABLE_CHARSET} COLLATE=${TABLE_COLLATE}`;

// ============================================
// DDL TEMPLATES
// ============================================
export const DDL_TEMPLATES = {
    // Table operations
    createTable: `CREATE TABLE IF NOT EXISTS \`{{table}}\` (
  {{columns}}
) ${TABLE_OPTIONS}`,

    dropTable: 'DROP TABLE IF EXISTS `{{table}}`',

    // Column operations
    addColumn: 'ALTER TABLE `{{table}}` ADD COLUMN {{columnDef}}',
    addColumnAfter: 'ALTER TABLE `{{table}}` ADD COLUMN {{columnDef}} AFTER `{{afterColumn}}`',
    dropColumn: 'ALTER TABLE `{{table}}` DROP COLUMN `{{column}}`',
    modifyColumn: 'ALTER TABLE `{{table}}` MODIFY COLUMN {{columnDef}}',

    // Index operations
    addIndex: 'ALTER TABLE `{{table}}` ADD INDEX `{{indexName}}` ({{columns}})',
    addUniqueIndex: 'ALTER TABLE `{{table}}` ADD UNIQUE INDEX `{{indexName}}` ({{columns}})',
    dropIndex: 'ALTER TABLE `{{table}}` DROP INDEX `{{indexName}}`',

    // Timestamp columns (pre-built)
    createdAtColumn: '`created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    updatedAtColumn: '`updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
    deletedAtColumn: '`deleted_at` TIMESTAMP NULL',
} as const;

// ============================================
// TEMPLATE HELPERS
// ============================================

/**
 * Replace {{placeholders}} in template with values
 */
export function formatDDL(template: string, values: Record<string, string>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => values[key] || '');
}

/**
 * Escape identifier (table/column name) for SQL
 */
export function escapeIdentifier(name: string): string {
    return `\`${name.replace(/`/g, '``')}\``;
}

/**
 * Escape string value for SQL
 */
export function escapeString(value: string): string {
    return `'${value.replace(/'/g, "''")}'`;
}
