/**
 * page-schema-list-resources-get/model.ts
 */

export async function getResources(db: any, tableId: string) {
  const res: any = await db.execute(
    `SELECT * FROM database_resources WHERE database_table_id = ?`,
    [tableId]
  );
  return Array.isArray(res) ? (Array.isArray(res[0]) ? res[0] : res) : (res.rows || []);
}
