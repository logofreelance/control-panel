/**
 * me-get/model.ts
 */
export async function findAdminUserProfileById(db: any, userId: string) {
    const res: any = await db.execute('SELECT id, username, role FROM admin_users WHERE id = ? LIMIT 1', [userId]);
    const rows = Array.isArray(res) ? res : res.rows;
    if (!rows || rows.length === 0) return null;
    return rows[0] as { id: string, username: string, role: string };
}
