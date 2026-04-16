/**
 * schema-column-drop-delete/model.ts
 */
export async function findSchemaById(db: any, id: string) {
  const res: any = await db.execute('SELECT * FROM database_tables WHERE id = ?', [id]);
  const rows = Array.isArray(res) ? res : res.rows || [];
  return rows.length ? rows[0] : null;
}

export async function dropPhysicalColumn(db: any, tableName: string, columnName: string) {
  const sql = `ALTER TABLE ${tableName} DROP COLUMN ${columnName}`;
  return db.execute(sql);
}
