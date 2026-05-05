/**
 * middleware/handler.ts
 */
import type { Context, Next } from 'hono';
import { Lucia } from 'lucia';
import { connect } from '@tidbcloud/serverless';
import type { EnvironmentConfig } from '../../../env';
import { targetStore } from '../target.store';

function buildDatabaseConnection(databaseUrl: string): any {
    if (!databaseUrl) throw new Error('INTERNAL DB URL MISSING');
    const httpUrl = databaseUrl.replace('mysql://', 'https://').replace(':4000', '');
    return connect({ url: httpUrl });
}

class AuthAdapter {
    constructor(private db: any) {}
    async deleteSession(sessionId: string): Promise<void> { await this.db.execute('DELETE FROM admin_sessions WHERE id = ?', [sessionId]); }
    async deleteUserSessions(userId: string): Promise<void> { await this.db.execute('DELETE FROM admin_sessions WHERE user_id = ?', [userId]); }
    async getSessionAndUser(sessionId: string): Promise<[any | null, any | null]> {
        const resSession: any = await this.db.execute('SELECT * FROM admin_sessions WHERE id = ?', [sessionId]);
        const sessionRows = Array.isArray(resSession) ? (Array.isArray(resSession[0]) ? resSession[0] : resSession) : resSession.rows;
        if (!sessionRows || sessionRows.length === 0) return [null, null];
        const session = sessionRows[0];
        const resUser: any = await this.db.execute('SELECT id, username, role FROM admin_users WHERE id = ?', [session.user_id]);
        const userRows = Array.isArray(resUser) ? (Array.isArray(resUser[0]) ? resUser[0] : resUser) : resUser.rows;
        if (!userRows || userRows.length === 0) return [null, null];
        const user = userRows[0];

        const expiresAtRaw = session.expires_at;
        const expiresAt = typeof expiresAtRaw === 'string' && !expiresAtRaw.endsWith('Z') && !expiresAtRaw.includes('+') 
            ? new Date(expiresAtRaw + 'Z') 
            : new Date(expiresAtRaw);

        return [{ id: session.id, userId: session.user_id, expiresAt, attributes: {} }, { id: user.id, attributes: { username: user.username, role: user.role } }];
    }
    async getUserSessions(userId: string): Promise<any[]> {
        const res: any = await this.db.execute('SELECT * FROM admin_sessions WHERE user_id = ?', [userId]);
        const rows = Array.isArray(res) ? (Array.isArray(res[0]) ? res[0] : res) : res.rows;
        return (rows || []).map((s: any) => ({ id: s.id, userId: s.user_id, expiresAt: new Date(s.expires_at + 'Z'), attributes: {} }));
    }
    async setSession(session: any): Promise<void> {
        const expiresAt = session.expiresAt.toISOString();
        await this.db.execute('INSERT INTO admin_sessions (id, user_id, expires_at) VALUES (?, ?, ?)', [session.id, session.userId, expiresAt]);
    }
    async updateSessionExpiration(sessionId: string, expiresAt: Date): Promise<void> {
        const expiresAtStr = expiresAt.toISOString();
        await this.db.execute('UPDATE admin_sessions SET expires_at = ? WHERE id = ?', [expiresAtStr, sessionId]);
    }
    async deleteExpiredSessions(): Promise<void> {}
}

export function middleware(env: EnvironmentConfig) {
    const isProd = env.NODE_ENV === 'production';
    const db = buildDatabaseConnection(env.DATABASE_URL_INTERNAL_CONTROL_PANEL);
    const adapter = new AuthAdapter(db) as any;
    const { TimeSpan } = require('lucia');
    const lucia = new Lucia(adapter, {
        sessionExpiresIn: new TimeSpan(30, "d"),
        sessionCookie: { attributes: { secure: isProd, sameSite: isProd ? 'none' : 'lax' } },
        getUserAttributes: (attributes: any) => ({ username: attributes?.username ?? '', role: attributes?.role ?? '' })
    });

    return async (c: Context, next: Next) => {
        const sessionId = lucia.readSessionCookie(c.req.header('Cookie') ?? '') 
                       ?? lucia.readBearerToken(c.req.header('Authorization') ?? '');
                       
        if (!sessionId) return c.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, 401);

        try {
            const { session, user } = await lucia.validateSession(sessionId);
            if (!session) {
                c.header('Set-Cookie', lucia.createBlankSessionCookie().serialize(), { append: true });
                return c.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, 401);
            }
            if (session.fresh) c.header('Set-Cookie', lucia.createSessionCookie(session.id).serialize(), { append: true });
            
            c.set('session', session);
            c.set('user', user);
            c.set('internalDb', db);

            // 🤖 AI: Initialize TargetStore (Synchronous Cache)
            await targetStore.initialize(db);
        } catch (err: any) {
            console.error('[AUTH MIDDLEWARE DB ERROR]', err);
            return c.json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal Server Error during session validation' } }, 500);
        }
        await next();
    };
}

