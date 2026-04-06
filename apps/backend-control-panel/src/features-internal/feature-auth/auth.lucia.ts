import { Lucia, TimeSpan } from "lucia";
import type { InternalDatabaseConnection } from "../internal.db";

export type AuthPanelLuciaInstance = Lucia;

// Minimal custom adapter for TiDB Serverless mapped to admin_sessions and admin_users
class TiDBServerlessAdminAdapter {
    constructor(private db: InternalDatabaseConnection) {}

    async deleteSession(sessionId: string): Promise<void> {
        await this.db.execute(`DELETE FROM admin_sessions WHERE id = ?`, [sessionId]);
    }

    async deleteUserSessions(userId: string): Promise<void> {
        await this.db.execute(`DELETE FROM admin_sessions WHERE user_id = ?`, [userId]);
    }

    async getSessionAndUser(sessionId: string): Promise<[any | null, any | null]> {
        const resSession: any = await this.db.execute(`SELECT * FROM admin_sessions WHERE id = ?`, [sessionId]);
        const sessionRows = Array.isArray(resSession) ? resSession : resSession.rows;
        if (!sessionRows || sessionRows.length === 0) return [null, null];
        const session = sessionRows[0];

        const resUser: any = await this.db.execute(`SELECT id, username, role FROM admin_users WHERE id = ?`, [session.user_id]);
        const userRows = Array.isArray(resUser) ? resUser : resUser.rows;
        if (!userRows || userRows.length === 0) return [null, null];
        const user = userRows[0];

        return [
            { id: session.id, userId: session.user_id, expiresAt: new Date(session.expires_at) },
            { id: user.id, username: user.username, role: user.role }
        ];
    }

    async getTargetSessions(userId: string): Promise<any[]> {
        const res: any = await this.db.execute(`SELECT * FROM admin_sessions WHERE user_id = ?`, [userId]);
        const rows = Array.isArray(res) ? res : res.rows;
        return rows.map((s: any) => ({
            id: s.id, userId: s.user_id, expiresAt: new Date(s.expires_at)
        }));
    }

    async setSession(session: any): Promise<void> {
        const expiresAt = session.expiresAt.toISOString().slice(0, 19).replace('T', ' ');
        await this.db.execute(
            `INSERT INTO admin_sessions (id, user_id, expires_at) VALUES (?, ?, ?)`,
            [session.id, session.userId, expiresAt]
        );
    }

    async updateSessionExpiration(sessionId: string, expiresAt: Date): Promise<void> {
        const expiresAtStr = expiresAt.toISOString().slice(0, 19).replace('T', ' ');
        await this.db.execute(`UPDATE admin_sessions SET expires_at = ? WHERE id = ?`, [expiresAtStr, sessionId]);
    }
    
    async deleteExpiredSessions(): Promise<void> {
        await this.db.execute(`DELETE FROM admin_sessions WHERE expires_at <= NOW()`);
    }
}

export function buildAuthPanelLucia(db: InternalDatabaseConnection): AuthPanelLuciaInstance {
    const adapter = new TiDBServerlessAdminAdapter(db) as any;
    return new Lucia(adapter, {
        sessionCookie: {
            attributes: {
                secure: true, // Wajib TRUE untuk SameSite=None
                sameSite: "none" // Izinkan cookie lintas subdomain/cross-site
            }
        },
        getUserAttributes: (attributes: any) => {
            return {
                username: attributes?.username ?? '',
                role: attributes?.role ?? '',
            };
        }
    });
}
