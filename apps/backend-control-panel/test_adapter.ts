import { connect } from '@tidbcloud/serverless';
import * as dotenv from 'dotenv';
dotenv.config();
const db = connect({ url: process.env.DATABASE_URL_INTERNAL_CONTROL_PANEL.replace('mysql://', 'https://').replace(':4000', '') });

class AuthAdapter {
    constructor(private db: any) {}
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
}
const adapter = new AuthAdapter(db);
adapter.getSessionAndUser('iopwe7tt7i6eenmgcetfwyfez62styjtqctgp6h5').then(res => console.log('RESULT:', JSON.stringify(res))).catch(console.error);
