import type { InternalDatabaseConnection } from '../internal.db';
import type { AuthPanelAdminProfile } from './auth.types';

export async function findAdminUserByUsername(
    db: InternalDatabaseConnection, username: string
): Promise<{ id: string, password_hash: string, role: string } | null> {
    const res: any = await db.execute(`SELECT id, password_hash, role FROM admin_users WHERE username = ? LIMIT 1`, [username]);
    const rows = Array.isArray(res) ? res : res.rows;
    if (!rows || rows.length === 0) return null;
    return rows[0] as any;
}

export async function findAdminUserProfileById(
    db: InternalDatabaseConnection, userId: string
): Promise<AuthPanelAdminProfile | null> {
    const res: any = await db.execute(`SELECT id, username, role FROM admin_users WHERE id = ? LIMIT 1`, [userId]);
    const rows = Array.isArray(res) ? res : res.rows;
    if (!rows || rows.length === 0) return null;
    return rows[0] as any;
}

export async function updateAdminUserPassword(
    db: InternalDatabaseConnection, userId: string, passwordHash: string
): Promise<void> {
    await db.execute(`UPDATE admin_users SET password_hash = ? WHERE id = ?`, [passwordHash, userId]);
}

export async function updateAdminUserProfile(
    db: InternalDatabaseConnection, userId: string, username: string
): Promise<void> {
    await db.execute(`UPDATE admin_users SET username = ? WHERE id = ?`, [username, userId]);
}

export async function createAdminUser(
    db: InternalDatabaseConnection, userId: string, username: string, passwordHash: string
): Promise<void> {
    await db.execute(
        `INSERT INTO admin_users (id, username, password_hash, role, created_at) VALUES (?, ?, ?, 'admin', NOW())`,
        [userId, username, passwordHash]
    );
}
