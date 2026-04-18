/**
 * login-post/model.ts
 */
export async function findAdminUserByUsername(db: any, username: string): Promise<{ id: string, password_hash: string, role: string } | null> {
    const res: any = await db.execute('SELECT id, password_hash, role FROM admin_users WHERE username = ? LIMIT 1', [username]);
    const rows = Array.isArray(res) ? res : res.rows;
    if (!rows || rows.length === 0) return null;
    return rows[0] as any;
}
