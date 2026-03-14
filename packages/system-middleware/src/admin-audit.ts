/**
 * backend/src/middleware/admin-audit.ts
 * 
 * Admin action audit logging middleware
 * Logs all write operations in the Orange layer for security auditing
 */

import { Context, Next } from 'hono';
import { getEnv, getClientIp, safeJsonStringify } from './utils';
import { MIDDLEWARE } from './config/labels';
import { MIDDLEWARE_SYSTEM } from './config/constants';

const { HEADERS, STATUS } = MIDDLEWARE_SYSTEM;

// ============================================
// AUDIT LOG TYPES
// ============================================

export interface AuditLogEntry {
    timestamp: string;
    action: string;
    method: string;
    path: string;
    ip: string;
    userAgent: string;
    adminId?: number;
    adminUsername?: string;
    statusCode?: number;
    durationMs?: number;
    requestBody?: string;
    error?: string;
}

// In-memory buffer for batch writing (optional - can be extended to write to DB)
const auditBuffer: AuditLogEntry[] = [];
const MAX_BUFFER_SIZE = 100;

// ============================================
// AUDIT FUNCTIONS
// ============================================

/**
 * Log an admin action
 */
export function logAdminAction(entry: AuditLogEntry): void {
    // Add to buffer
    auditBuffer.push(entry);

    // Also log to console with structured format
    console.log(MIDDLEWARE.LOG.ADMIN_AUDIT, entry.timestamp, entry.method, entry.path, entry.ip, entry.statusCode || 'pending');

    // Trim buffer if too large
    if (auditBuffer.length > MAX_BUFFER_SIZE) {
        auditBuffer.shift();
    }
}

/**
 * Get recent audit logs
 */
export function getRecentAuditLogs(limit: number = 50): AuditLogEntry[] {
    return auditBuffer.slice(-limit).reverse();
}

/**
 * Clear audit buffer
 */
export function clearAuditBuffer(): void {
    auditBuffer.length = 0;
}

// ============================================
// MIDDLEWARE
// ============================================

/**
 * Admin audit logging middleware
 * Should be applied to Orange layer routes
 */
export const adminAuditMiddleware = async (c: Context, next: Next) => {
    // Only audit write operations
    const method = c.req.method;
    if (method === 'GET' || method === 'OPTIONS' || method === 'HEAD') {
        return next();
    }

    const startTime = Date.now();
    const timestamp = new Date().toISOString();
    const ip = getClientIp(c.req.raw.headers as unknown as { get(name: string): string | undefined });
    const userAgent = c.req.header(HEADERS.USER_AGENT) || 'unknown';
    const path = c.req.path;

    // Try to get request body for logging (clone the request)
    let requestBodyStr: string | undefined;
    try {
        // MUST clone the request before parsing JSON otherwise downstream handlers will crash!
        const bodyText = await c.req.raw.clone().text();
        if (bodyText) {
            const body = JSON.parse(bodyText);
            // Sanitize sensitive fields before logging
            const sanitizedBody = { ...body };
            if (sanitizedBody.password) sanitizedBody.password = '[REDACTED]';
            if (sanitizedBody.currentPassword) sanitizedBody.currentPassword = '[REDACTED]';
            if (sanitizedBody.newPassword) sanitizedBody.newPassword = '[REDACTED]';
            if (sanitizedBody.passwordHash) sanitizedBody.passwordHash = '[REDACTED]';
            requestBodyStr = safeJsonStringify(sanitizedBody, '{}');
        }
    } catch {
        // No JSON body or already consumed
    }

    // Get admin info from context if available
    const adminUser = (c as any).adminUser;

    let statusCode: number | undefined;
    let errorMsg: string | undefined;

    try {
        await next();
        statusCode = c.res.status;
    } catch (err) {
        errorMsg = err instanceof Error ? err.message : String(err);
        statusCode = 500;
        throw err;
    } finally {
        const durationMs = Date.now() - startTime;

        logAdminAction({
            timestamp,
            action: `${method} ${path}`,
            method,
            path,
            ip,
            userAgent,
            adminId: adminUser?.id,
            adminUsername: adminUser?.username,
            statusCode,
            durationMs,
            requestBody: requestBodyStr,
            error: errorMsg,
        });
    }
};

/**
 * Get audit logs handler (can be exposed as an endpoint)
 */
export function getAuditLogs(c: Context) {
    const limit = parseInt(c.req.query('limit') || '50', 10);
    const logs = getRecentAuditLogs(Math.min(limit, 100));

    return c.json({
        status: STATUS.SUCCESS,
        data: logs,
        total: logs.length,
    });
}
