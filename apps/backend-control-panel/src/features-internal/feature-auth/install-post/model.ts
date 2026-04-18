/**
 * install-post/model.ts
 */
export async function getAdminUsersCount(db: any): Promise<number> {
    const res: any = await db.execute('SELECT COUNT(*) as count FROM admin_users');
    const rows = Array.isArray(res) ? res : res.rows;
    return Number(rows[0]?.count || 0);
}
export async function createAdminUser(db: any, userId: string, username: string, passwordHash: string): Promise<void> {
    await db.execute(
        `INSERT INTO admin_users (id, username, password_hash, role, created_at) VALUES (?, ?, ?, 'admin', NOW())`,
        [userId, username, passwordHash]
    );
}
