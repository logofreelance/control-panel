/**
 * delete-delete/model.ts
 */
export async function deleteAdminUser(db: any, id: string): Promise<void> {
    await db.execute('DELETE FROM admin_users WHERE id = ?', [id]);
}
