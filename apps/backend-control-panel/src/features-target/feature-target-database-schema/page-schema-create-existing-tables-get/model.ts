/**
 * page-schema-create-existing-tables-get/model.ts
 */

export async function getExistingTables(db: any) {
  const res: any = await db.execute(`SELECT name, table_name FROM database_tables WHERE is_archived = 0`);
  return Array.isArray(res) ? (Array.isArray(res[0]) ? res[0] : res) : (res.rows || []);
}
