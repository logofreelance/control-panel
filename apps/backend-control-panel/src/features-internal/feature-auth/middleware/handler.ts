/**
 * middleware/handler.ts
 *
 * Auth Middleware for Control Panel Admin Auth.
 * Initializes DB connection, Lucia, and validates session.
 * Provides internalDb, lucia, session, and user in context.
 */

import type { Context, Next } from 'hono';
import { Lucia } from 'lucia';
import { connect } from '@tidbcloud/serverless';
import type { EnvironmentConfig } from '../../../env';
import { executeSafe } from '../../internal.db';

// ─── DB Connection ───────────────────────────────────────
function buildDatabaseConnection(databaseUrl: string): any {
    if (!databaseUrl) throw new Error('INTERNAL DB URL MISSING');
    const httpUrl = databaseUrl.replace('mysql://', 'https://').replace(':4000', '');
    return connect({ url: httpUrl });
}

// ─── Lucia Adapter ────────────────────────────────────────
class AuthAdapter {
    constructor(private db: any) {}
    async deleteSession(sessionId: string): Promise<void> {
        await this.db.execute('DELETE FROM admin_sessions WHERE id = ?', [sessionId]);
    }
    async deleteUserSessions(userId: string): Promise<void> {
        await this.db.execute('DELETE FROM admin_sessions WHERE user_id = ?', [userId]);
    }
    async getSessionAndUser(sessionId: string): Promise<[any | null, any | null]> {
        const sessionRows = await executeSafe(this.db, 'SELECT * FROM admin_sessions WHERE id = ?', [sessionId]);
        if (sessionRows.length === 0) return [null, null];
        const session = sessionRows[0];

        const userRows = await executeSafe(this.db, 'SELECT id, username, role FROM admin_users WHERE id = ?', [session.user_id]);
        if (userRows.length === 0) return [null, null];
        const user = userRows[0];

        // Ensure expires_at is parsed as UTC — TiDB may return without timezone suffix
        const expiresAtRaw = session.expires_at;
        const expiresAt = typeof expiresAtRaw === 'string' && !expiresAtRaw.endsWith('Z') && !expiresAtRaw.includes('+') 
            ? new Date(expiresAtRaw + 'Z') 
            : new Date(expiresAtRaw);

        return [
            { id: session.id, userId: session.user_id, expiresAt, attributes: {} },
            { id: user.id, attributes: { username: user.username, role: user.role } }
        ];
    }
    async getUserSessions(userId: string): Promise<any[]> {
        const rows = await executeSafe(this.db, 'SELECT * FROM admin_sessions WHERE user_id = ?', [userId]);
        return rows.map((s: any) => ({ id: s.id, userId: s.user_id, expiresAt: new Date(s.expires_at + 'Z'), attributes: {} }));
    }
    async setSession(session: any): Promise<void> {
        const expiresAt = session.expiresAt.toISOString();
        await this.db.execute('INSERT INTO admin_sessions (id, user_id, expires_at) VALUES (?, ?, ?)', [session.id, session.userId, expiresAt]);
    }
    async updateSessionExpiration(sessionId: string, expiresAt: Date): Promise<void> {
        const expiresAtStr = expiresAt.toISOString();
        await this.db.execute('UPDATE admin_sessions SET expires_at = ? WHERE id = ?', [expiresAtStr, sessionId]);
    }
    async deleteExpiredSessions(): Promise<void> {
        await this.db.execute('DELETE FROM admin_sessions WHERE expires_at <= NOW()');
    }
}

// ─── Middleware Factory ──────────────────────────────────
export function middleware(env: EnvironmentConfig) {
    const isProd = env.NODE_ENV === 'production';
    const db = buildDatabaseConnection(env.DATABASE_URL_INTERNAL_CONTROL_PANEL);
    const adapter = new AuthAdapter(db) as any;
    
    const { TimeSpan } = require('lucia');
    const lucia = new Lucia(adapter, {
        sessionExpiresIn: new TimeSpan(30, "d"),
        sessionCookie: {
            attributes: { secure: isProd, sameSite: isProd ? 'none' : 'lax' }
        },
        getUserAttributes: (attributes: any) => ({
            username: attributes?.username ?? '',
            role: attributes?.role ?? '',
        })
    });

    return async (c: Context, next: Next) => {
        const sessionId = lucia.readSessionCookie(c.req.header('Cookie') ?? '') 
                       ?? lucia.readBearerToken(c.req.header('Authorization') ?? '');
                       
        if (!sessionId) {
            c.set('user', null);
            c.set('session', null);
        } else {
            try {
                const { session, user } = await lucia.validateSession(sessionId);
                if (session && session.fresh) {
                    c.header('Set-Cookie', lucia.createSessionCookie(session.id).serialize(), { append: true });
                }
                if (!session) {
                    c.header('Set-Cookie', lucia.createBlankSessionCookie().serialize(), { append: true });
                }
                c.set('session', session);
                c.set('user', user);
            } catch (err: any) {
                console.error('[AUTH MIDDLEWARE] Session validation failed (likely DB error):', err);
                // DO NOT delete the session cookie here. If it's a transient DB error (e.g. fetch failed), 
                // deleting the cookie logs the user out permanently.
                // Instead, return a 500 error so the frontend knows it's a server issue, not an auth issue.
                return c.json({ success: false, message: 'Internal server error during session validation' }, 500);
            }
        }

        c.set('internalDb' as any, db);
        c.set('lucia' as any, lucia);
        await next();
    };
}

