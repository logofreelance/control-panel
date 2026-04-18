/**
 * delete-delete/model.ts
 */
export async function removeTargetSystem(db: any, id: string): Promise<void> {
    await db.execute('DELETE FROM target_systems WHERE id = ?', [id]);
}

export async function checkTargetSystemExists(db: any, id: string): Promise<boolean> {
    const res: any = await db.execute('SELECT id FROM target_systems WHERE id = ?', [id]);
    const rows = Array.isArray(res) ? res : (res.rows || []);
    return rows.length > 0;
}
