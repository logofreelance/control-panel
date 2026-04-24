/**
 * page-schema-editor-detail-get/model.ts
 */

export async function getSchemaDetail(db: any, id: string) {
  const res: any = await db.execute(`SELECT * FROM database_tables WHERE id = ?`, [id]);
  const rows = Array.isArray(res) ? (Array.isArray(res[0]) ? res[0] : res) : (res.rows || []);
  return rows.length > 0 ? rows[0] : null;
}
