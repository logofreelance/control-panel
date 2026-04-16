/**
 * data-list-get/model.ts
 *
 * SQL: Find schema by ID + Fetch rows with count from physical table
 */

export async function findSchemaById(db: any, id: string) {
  const res: any = await db.execute('SELECT * FROM database_tables WHERE id = ?', [id]);
  const rows = Array.isArray(res) ? res : res.rows || [];
  return rows.length ? rows[0] : null;
}

export async function fetchRows(db: any, tableName: string, limit: number = 100) {
  const countRes: any = await db.execute(`SELECT COUNT(*) as total FROM ${tableName}`);
  const countRows = Array.isArray(countRes) ? countRes : countRes.rows || [];
  const total = countRows[0]?.total || 0;

  const dataRes: any = await db.execute(`SELECT * FROM ${tableName} ORDER BY 1 DESC LIMIT ?`, [limit]);
  const data = Array.isArray(dataRes) ? dataRes : dataRes.rows || [];

  return { data, total };
}
