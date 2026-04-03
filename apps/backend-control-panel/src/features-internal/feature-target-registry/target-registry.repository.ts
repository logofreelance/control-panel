/**
 * feature-target-registry — Database Access Layer
 * 
 * 🤖 AI: All SQL queries for the `target_systems` table.
 * Uses Internal DB (Control Panel's own database).
 */

import type { InternalDatabaseConnection } from '../internal.db';
import type { TargetSystemRow } from './target-registry.types';

export async function findAllTargetSystems(db: InternalDatabaseConnection): Promise<TargetSystemRow[]> {
    const res: any = await db.execute('SELECT * FROM target_systems ORDER BY created_at DESC');
    const rows = Array.isArray(res) ? res : (res.rows || []);
    return rows as TargetSystemRow[];
}

export async function findTargetSystemById(db: InternalDatabaseConnection, id: string): Promise<TargetSystemRow | null> {
    const res: any = await db.execute('SELECT * FROM target_systems WHERE id = ?', [id]);
    const rows = Array.isArray(res) ? res : (res.rows || []);
    return rows.length > 0 ? rows[0] as TargetSystemRow : null;
}

export async function createTargetSystem(
    db: InternalDatabaseConnection,
    id: string,
    name: string,
    description: string,
    databaseUrl: string,
    apiEndpoint: string | null
): Promise<void> {
    await db.execute(
        'INSERT INTO target_systems (id, name, description, database_url, api_endpoint) VALUES (?, ?, ?, ?, ?)',
        [id, name, description, databaseUrl, apiEndpoint]
    );
}

export async function updateTargetSystem(
    db: InternalDatabaseConnection,
    id: string,
    fields: Record<string, string>
): Promise<void> {
    const setClauses: string[] = [];
    const values: string[] = [];

    for (const [key, value] of Object.entries(fields)) {
        setClauses.push(`${key} = ?`);
        values.push(value);
    }

    if (setClauses.length === 0) return;

    values.push(id);
    await db.execute(
        `UPDATE target_systems SET ${setClauses.join(', ')} WHERE id = ?`,
        values
    );
}

export async function removeTargetSystem(db: InternalDatabaseConnection, id: string): Promise<void> {
    await db.execute('DELETE FROM target_systems WHERE id = ?', [id]);
}

export async function updateTargetSystemHealth(
    db: InternalDatabaseConnection,
    id: string,
    status: string,
    routeCount: number
): Promise<void> {
    await db.execute(
        'UPDATE target_systems SET status = ?, route_count = ?, last_health_check = NOW() WHERE id = ?',
        [status, routeCount, id]
    );
}
