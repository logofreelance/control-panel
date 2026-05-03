/**
 * update-profile-put/model.ts
 */
export async function updateAdminUserProfile(db: any, userId: string, username: string): Promise<void> {
    await db.execute('UPDATE admin_users SET username = ? WHERE id = ?', [username, userId]);
}
export async function findAdminUserProfileById(db: any, userId: string) {
    const res: any = await db.execute('SELECT id, username, role FROM admin_users WHERE id = ? LIMIT 1', [userId]);
    const rows = Array.isArray(res) ? (Array.isArray(res[0]) ? res[0] : res) : (res.rows || []);
    return rows && rows.length > 0 ? rows[0] : null;
}
