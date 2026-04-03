/**
 * feature-target-registry — Business Logic Layer
 * 
 * 🤖 AI: Validates input, transforms DB rows, tests connections,
 * counts active routes in target DBs, and manages health status.
 */

import { connect } from '@tidbcloud/serverless';
import type { InternalDatabaseConnection } from '../internal.db';
import * as repo from './target-registry.repository';
import { TARGET_SYSTEM_STATUS } from './target-registry.config';
import type { TargetSystem, TargetSystemRow, CreateTargetInput, UpdateTargetInput, HealthCheckResult } from './target-registry.types';

/** Transform a DB row (snake_case) into a frontend-ready object (camelCase) */
function rowToTargetSystem(row: TargetSystemRow): TargetSystem {
    return {
        id: row.id,
        name: row.name,
        description: row.description || '',
        apiEndpoint: row.api_endpoint || null,
        databaseUrl: maskDatabaseUrl(row.database_url),
        status: (row.status as TargetSystem['status']) || TARGET_SYSTEM_STATUS.UNKNOWN,
        routeCount: row.route_count || 0,
        lastHealthCheck: row.last_health_check,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

/** Mask the database URL for frontend display (hide password) */
function maskDatabaseUrl(url: string): string {
    try {
        const parsed = new URL(url.replace('mysql://', 'https://'));
        if (parsed.password) {
            parsed.password = '****';
        }
        return parsed.toString().replace('https://', 'mysql://');
    } catch {
        return '****';
    }
}

/** Connect to a target DB using its stored database_url */
function connectToTargetDb(databaseUrl: string) {
    const httpUrl = databaseUrl.replace('mysql://', 'https://').replace(':4000', '');
    return connect({ url: httpUrl });
}

export async function listTargetSystems(db: InternalDatabaseConnection): Promise<TargetSystem[]> {
    const rows = await repo.findAllTargetSystems(db);
    return rows.map(rowToTargetSystem);
}

export async function getTargetSystemById(db: InternalDatabaseConnection, id: string): Promise<TargetSystem | null> {
    const row = await repo.findTargetSystemById(db, id);
    return row ? rowToTargetSystem(row) : null;
}

export async function createTargetSystem(db: InternalDatabaseConnection, input: CreateTargetInput): Promise<TargetSystem> {
    if (!input.name?.trim()) throw new Error('Name is required');
    if (!input.databaseUrl?.trim()) throw new Error('Database URL is required');

    const id = crypto.randomUUID();
    await repo.createTargetSystem(db, id, input.name.trim(), input.description?.trim() || '', input.databaseUrl.trim(), input.apiEndpoint?.trim() || null);

    // Auto health-check after registration
    try {
        await performHealthCheck(db, id);
    } catch { /* non-blocking */ }

    const created = await repo.findTargetSystemById(db, id);
    if (!created) throw new Error('Failed to create target system');
    return rowToTargetSystem(created);
}

export async function updateTargetSystem(db: InternalDatabaseConnection, id: string, input: UpdateTargetInput): Promise<TargetSystem> {
    const existing = await repo.findTargetSystemById(db, id);
    if (!existing) throw new Error('Target system not found');

    const fields: Record<string, string> = {};
    if (input.name !== undefined) fields['name'] = input.name.trim();
    if (input.description !== undefined) fields['description'] = input.description.trim();
    if (input.apiEndpoint !== undefined) fields['api_endpoint'] = input.apiEndpoint.trim();
    if (input.databaseUrl !== undefined) fields['database_url'] = input.databaseUrl.trim();

    await repo.updateTargetSystem(db, id, fields);

    const updated = await repo.findTargetSystemById(db, id);
    if (!updated) throw new Error('Failed to update target system');
    return rowToTargetSystem(updated);
}

export async function removeTargetSystem(db: InternalDatabaseConnection, id: string): Promise<void> {
    const existing = await repo.findTargetSystemById(db, id);
    if (!existing) throw new Error('Target system not found');
    await repo.removeTargetSystem(db, id);
}

/** Test a database connection by running a simple query. Returns latency in ms. */
export async function testDatabaseConnection(databaseUrl: string): Promise<{ ok: boolean; latencyMs: number; error?: string }> {
    const start = Date.now();
    try {
        const testDb = connectToTargetDb(databaseUrl);
        await testDb.execute('SELECT 1');
        return { ok: true, latencyMs: Date.now() - start };
    } catch (err: any) {
        return { ok: false, latencyMs: Date.now() - start, error: err?.message || 'Connection failed' };
    }
}

/**
 * Full health check: test connection + count active routes in target DB.
 * Updates the target system's status, route_count, and last_health_check.
 */
export async function performHealthCheck(db: InternalDatabaseConnection, targetId: string): Promise<HealthCheckResult> {
    const row = await repo.findTargetSystemById(db, targetId);
    if (!row) throw new Error('Target system not found');

    const start = Date.now();
    try {
        const targetDb = connectToTargetDb(row.database_url);

        // Test connection
        await targetDb.execute('SELECT 1');

        // Count active routes in target DB
        let routeCount = 0;
        try {
            const countRes: any = await targetDb.execute('SELECT COUNT(*) as cnt FROM route_dynamic WHERE is_active = 1');
            const rows = Array.isArray(countRes) ? countRes : (countRes.rows || []);
            routeCount = rows.length > 0 ? Number(rows[0]?.cnt || rows[0]?.['COUNT(*)'] || 0) : 0;
        } catch {
            // Table might not exist yet — that's ok, route_count stays 0
        }

        // Auto-detect active API endpoint from node_health_metrics
        let detectedApiEndpoint = null;
        try {
            // Find ALL online nodes that reported a heartbeat within the last 2 minutes
            const nodeRes: any = await targetDb.execute(`
                SELECT DISTINCT endpoint_url 
                FROM node_health_metrics 
                WHERE status = 'online' 
                  AND last_heartbeat >= DATE_SUB(NOW(), INTERVAL 2 MINUTE)
            `);
            const rows = Array.isArray(nodeRes) ? nodeRes : (nodeRes.rows || []);
            const validEndpoints = rows
                 .map((r: any) => r.endpoint_url)
                 .filter((url: string) => url && url.startsWith('http'));

            if (validEndpoints.length > 0) {
                // Join multiple endpoints with a comma to store in the VARCHAR(500) column
                detectedApiEndpoint = validEndpoints.join(',');
            }
        } catch {
            // Table might not exist yet — that's ok, we just keep the old endpoint
        }

        const latencyMs = Date.now() - start;

        // Update API endpoint in Internal DB if detected
        if (detectedApiEndpoint) {
            await repo.updateTargetSystem(db, targetId, { api_endpoint: detectedApiEndpoint });
        }

        // Update status in Internal DB
        await repo.updateTargetSystemHealth(db, targetId, TARGET_SYSTEM_STATUS.ONLINE, routeCount);

        return { ok: true, latencyMs, routeCount, status: TARGET_SYSTEM_STATUS.ONLINE as any };
    } catch (err: any) {
        const latencyMs = Date.now() - start;
        await repo.updateTargetSystemHealth(db, targetId, TARGET_SYSTEM_STATUS.OFFLINE, 0);
        return { ok: false, latencyMs, routeCount: 0, status: TARGET_SYSTEM_STATUS.OFFLINE as any, error: err?.message || 'Connection failed' };
    }
}
