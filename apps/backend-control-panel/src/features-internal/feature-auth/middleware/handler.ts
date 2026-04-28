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
        const resSession: any = await this.db.execute('SELECT * FROM admin_sessions WHERE id = ?', [sessionId]);
        const sessionRows = Array.isArray(resSession) ? resSession : resSession.rows;
        if (!sessionRows || sessionRows.length === 0) return [null, null];
        const session = sessionRows[0];

        const resUser: any = await this.db.execute('SELECT id, username, role FROM admin_users WHERE id = ?', [session.user_id]);
        const userRows = Array.isArray(resUser) ? resUser : resUser.rows;
        if (!userRows || userRows.length === 0) return [null, null];
        const user = userRows[0];

        return [
            { id: session.id, userId: session.user_id, expiresAt: new Date(session.expires_at) },
            { id: user.id, username: user.username, role: user.role }
        ];
    }
    async getTargetSessions(userId: string): Promise<any[]> {
        const res: any = await this.db.execute('SELECT * FROM admin_sessions WHERE user_id = ?', [userId]);
        const rows = Array.isArray(res) ? res : res.rows;
        return rows.map((s: any) => ({ id: s.id, userId: s.user_id, expiresAt: new Date(s.expires_at) }));
    }
    async setSession(session: any): Promise<void> {
        const expiresAt = session.expiresAt.toISOString().slice(0, 19).replace('T', ' ');
        await this.db.execute('INSERT INTO admin_sessions (id, user_id, expires_at) VALUES (?, ?, ?)', [session.id, session.userId, expiresAt]);
    }
    async updateSessionExpiration(sessionId: string, expiresAt: Date): Promise<void> {
        const expiresAtStr = expiresAt.toISOString().slice(0, 19).replace('T', ' ');
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
    
    const { TimeSpan } = require('oslo');
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

