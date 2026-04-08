/**
 * feature-target-registry — HTTP Handlers
 * 
 * 🤖 AI: Maps HTTP requests to service layer calls.
 * Response format: { success: true/false, data, message }
 */

import type { Context } from 'hono';
import type { InternalDatabaseConnection } from '../internal.db';
import * as service from './target-registry.service';
import { requireAuthOrRespond } from '../feature-auth/auth.middleware';

function respondSuccess(c: Context, data: any, message: string, statusCode = 200) {
    return c.json({ success: true, data, message }, statusCode as any);
}

function respondError(c: Context, errorCode: string, message: string, statusCode: number) {
    return c.json({ success: false, error: { code: errorCode, message } }, statusCode as any);
}

export async function handleListTargetSystems(c: Context, db: InternalDatabaseConnection) {
    const authError = requireAuthOrRespond(c);
    if (authError) return authError;
    
    try {
        const list = await service.listTargetSystems(db);
        return respondSuccess(c, list, 'Target systems retrieved');
    } catch (err: any) {
        return respondError(c, 'LIST_FAILED', err.message, 500);
    }
}

export async function handleCreateTargetSystem(c: Context, db: InternalDatabaseConnection) {
    const authError = requireAuthOrRespond(c);
    if (authError) return authError;
    
    try {
        const body = await c.req.json();
        const created = await service.createTargetSystem(db, body);
        return respondSuccess(c, created, 'Target system registered', 201);
    } catch (err: any) {
        return respondError(c, 'CREATE_FAILED', err.message, 400);
    }
}

export async function handleUpdateTargetSystem(c: Context, db: InternalDatabaseConnection) {
    const authError = requireAuthOrRespond(c);
    if (authError) return authError;
    
    try {
        const id = c.req.param('id')!;
        const body = await c.req.json();
        const updated = await service.updateTargetSystem(db, id, body);
        return respondSuccess(c, updated, 'Target system updated');
    } catch (err: any) {
        const status = err.message.includes('not found') ? 404 : 400;
        return respondError(c, 'UPDATE_FAILED', err.message, status);
    }
}

export async function handleDeleteTargetSystem(c: Context, db: InternalDatabaseConnection) {
    const authError = requireAuthOrRespond(c);
    if (authError) return authError;
    
    try {
        const id = c.req.param('id')!;
        await service.removeTargetSystem(db, id);
        return respondSuccess(c, null, 'Target system removed');
    } catch (err: any) {
        const status = err.message.includes('not found') ? 404 : 400;
        return respondError(c, 'DELETE_FAILED', err.message, status);
    }
}

export async function handleTestConnection(c: Context) {
    const authError = requireAuthOrRespond(c);
    if (authError) return authError;
    
    try {
        const { databaseUrl } = await c.req.json();
        if (!databaseUrl) {
            return respondError(c, 'MISSING_URL', 'Database URL is required', 400);
        }
        const result = await service.testDatabaseConnection(databaseUrl);
        return respondSuccess(c, result, result.ok ? 'Connection successful' : 'Connection failed');
    } catch (err: any) {
        return respondError(c, 'TEST_FAILED', err.message, 500);
    }
}

export async function handleHealthCheck(c: Context, db: InternalDatabaseConnection) {
    const authError = requireAuthOrRespond(c);
    if (authError) return authError;
    
    try {
        const id = c.req.param('id')!;
        const result = await service.performHealthCheck(db, id);
        return respondSuccess(c, result, result.ok ? 'Target system is online' : 'Target system is offline');
    } catch (err: any) {
        const status = err.message.includes('not found') ? 404 : 500;
        return respondError(c, 'HEALTH_CHECK_FAILED', err.message, status);
    }
}
