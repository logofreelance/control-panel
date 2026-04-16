/**
 * schema-destroy-delete/model.ts
 *
 * SQL: Find schema by ID, drop physical table, delete metadata record
 */

export async function findSchemaById(db: any, id: string) {
  const res: any = await db.execute('SELECT * FROM database_tables WHERE id = ?', [id]);
  const rows = Array.isArray(res) ? res : res.rows || [];
  return rows.length ? rows[0] : null;
}

export async function dropPhysicalTable(db: any, tableName: string) {
  await db.execute(`DROP TABLE IF EXISTS ${tableName}`);
}

export async function deleteSchemaRecord(db: any, id: string) {
  await db.execute('DELETE FROM database_tables WHERE id = ?', [id]);
}
