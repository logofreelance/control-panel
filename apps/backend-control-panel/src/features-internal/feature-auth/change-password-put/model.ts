/**
 * change-password-put/model.ts
 */
export async function findAdminUserById(db: any, userId: string) {
    const res: any = await db.execute('SELECT id, password_hash, username FROM admin_users WHERE id = ? LIMIT 1', [userId]);
    const rows = Array.isArray(res) ? res : res.rows;
    return rows && rows.length > 0 ? rows[0] : null;
}
export async function updateAdminUserPassword(db: any, userId: string, passwordHash: string): Promise<void> {
    await db.execute('UPDATE admin_users SET password_hash = ? WHERE id = ?', [passwordHash, userId]);
}
