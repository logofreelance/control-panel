/**
 * data-delete-delete/model.ts
 */

export async function findSchemaById(db: any, id: string) {
  const res: any = await db.execute('SELECT * FROM database_tables WHERE id = ?', [id]);
  const rows = Array.isArray(res) ? res : res.rows || [];
  return rows.length ? rows[0] : null;
}

export async function deleteRow(db: any, tableName: string, rowId: string | number) {
  return db.execute(`DELETE FROM ${tableName} WHERE id = ?`, [rowId]);
}
