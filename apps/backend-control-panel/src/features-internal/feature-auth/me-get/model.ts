/**
 * me-get/model.ts
 */
import { executeSafe } from "../../internal.db";

export async function findAdminUserProfileById(db: any, userId: string) {
    const rows = await executeSafe(db, 'SELECT id, username, role FROM admin_users WHERE id = ? LIMIT 1', [userId]);
    if (rows.length === 0) return null;
    return rows[0] as { id: string, username: string, role: string };
}
