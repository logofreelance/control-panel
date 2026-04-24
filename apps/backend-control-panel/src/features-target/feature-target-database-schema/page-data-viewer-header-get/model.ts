/**
 * page-data-viewer-header-get/model.ts
 */

export async function getSchemaHeader(db: any, id: string) {
  const res: any = await db.execute(`SELECT id, name, table_name FROM database_tables WHERE id = ?`, [id]);
  const rows = Array.isArray(res) ? (Array.isArray(res[0]) ? res[0] : res) : (res.rows || []);
  return rows.length > 0 ? rows[0] : null;
}
