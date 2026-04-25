/**
 * page-resource-edit-available-joins-get/model.ts
 */

export async function getAvailableTables(db: any) {
  const res: any = await db.execute(`SELECT id, name, table_name FROM database_tables WHERE is_archived = 0`);
  return Array.isArray(res) ? (Array.isArray(res[0]) ? res[0] : res) : (res.rows || []);
}
