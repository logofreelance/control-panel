/**
 * list-get/model.ts
 */
export async function getAdminUsersList(db: any) {
    const res: any = await db.execute('SELECT id, username, role, created_at, updated_at FROM admin_users ORDER BY created_at DESC');
    const rows = Array.isArray(res) ? (Array.isArray(res[0]) ? res[0] : res) : (res.rows || []);
    return rows;
}
