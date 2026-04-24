/**
 * page-schema-trash-destroy-delete/model.ts
 * ONLY used by: TrashPage
 */

export async function getSchemaTableName(db: any, id: string): Promise<string | null> {
  const res: any = await db.execute(`SELECT table_name FROM database_tables WHERE id = ?`, [id]);
  const rows = Array.isArray(res) ? (Array.isArray(res[0]) ? res[0] : res) : (res.rows || []);
  return rows.length > 0 ? rows[0].table_name : null;
}

export async function destroySchema(db: any, id: string) {
  // Delete metadata and cascade relations if set up properly in DB
  await db.execute(`DELETE FROM database_tables WHERE id = ?`, [id]);
}
