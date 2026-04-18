/**
 * create-post/model.ts
 */
export async function createAdminUser(db: any, userId: string, username: string, passwordHash: string, role: string): Promise<void> {
    await db.execute(
        'INSERT INTO admin_users (id, username, password_hash, role) VALUES (?, ?, ?, ?)',
        [userId, username, passwordHash, role]
    );
}
