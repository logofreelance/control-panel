/**
 * packages/system-datasource/src/utils/common.ts
 * Internalized common utilities
 */

export function isSafeInteger(value: unknown): boolean {
    return Number.isSafeInteger(value);
}

export function safeJsonParse<T = any>(value: string, fallback: T): T {
    try {
        return JSON.parse(value);
    } catch {
        return fallback;
    }
}

export function validateBulkIds(ids: unknown): any[] {
    if (!Array.isArray(ids) || ids.length === 0) {
        throw new Error('Invalid IDs array');
    }
    return ids; // Simplified for now
}

export function escapeSQL(value: unknown): string {
    if (value === null || value === undefined) return 'NULL';
    if (typeof value === 'number') return String(value);
    if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
    return `'${String(value).replace(/'/g, "''")}'`;
}

export function sanitizeIdentifier(name: string): string {
    return name.replace(/[^a-zA-Z0-9_]/g, '');
}
