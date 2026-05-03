import { Lucia } from 'lucia';
import { connect } from '@tidbcloud/serverless';
import * as dotenv from 'dotenv';
dotenv.config();

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

const db = buildDatabaseConnection(process.env.DATABASE_URL_INTERNAL_CONTROL_PANEL!);
const adapter = new AuthAdapter(db);
const { TimeSpan } = require('lucia');
const lucia = new Lucia(adapter as any, {
    sessionExpiresIn: new TimeSpan(30, "d"),
    sessionCookie: { attributes: { secure: false, sameSite: 'lax' } },
    getUserAttributes: (attributes: any) => ({ username: attributes?.username ?? '', role: attributes?.role ?? '' })
});

async function test() {
    const cookieHeader = 'auth_session=iopwe7tt7i6eenmgcetfwyfez62styjtqctgp6h5';
    const sessionId = lucia.readSessionCookie(cookieHeader);
    console.log('READ SESSION ID:', sessionId);
    if (!sessionId) {
        console.log('FAILED TO READ SESSION ID');
        return;
    }
    const result = await lucia.validateSession(sessionId);
    console.log('VALIDATION RESULT:', JSON.stringify(result));
}

test().catch(console.error);
