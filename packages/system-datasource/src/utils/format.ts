/**
 * packages/system-datasource/src/utils/format.ts
 * 
 * Internalized formatting utilities
 */

export const TABLE_ENGINE = 'InnoDB';
export const TABLE_CHARSET = 'utf8mb4';
export const TABLE_COLLATE = 'utf8mb4_unicode_ci';

export function formatDDL(template: string, values: Record<string, string>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => values[key] || '');
}

export function escapeIdentifier(name: string): string {
    return `\`${name.replace(/`/g, '``')}\``;
}

export function escapeString(value: string): string {
    return `'${value.replace(/'/g, "''")}'`;
}
