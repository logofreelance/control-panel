/**
 * page-resource-edit-resource-get/model.ts
 */

export async function getResource(db: any, tableId: string, resourceId: string) {
  const res: any = await db.execute(
    `SELECT * FROM database_resources WHERE id = ? AND database_table_id = ?`,
    [resourceId, tableId]
  );
  const rows = Array.isArray(res) ? (Array.isArray(res[0]) ? res[0] : res) : (res.rows || []);
  return rows.length > 0 ? rows[0] : null;
}
