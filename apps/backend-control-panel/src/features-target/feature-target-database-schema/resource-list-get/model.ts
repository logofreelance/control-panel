/**
 * resource-list-get/model.ts
 *
 * SQL: Find schema by ID + Select all from route_dynamic
 */

export async function findSchemaById(db: any, id: string) {
  const res: any = await db.execute('SELECT * FROM database_tables WHERE id = ?', [id]);
  const rows = Array.isArray(res) ? res : res.rows || [];
  return rows.length ? rows[0] : null;
}

export async function routeDynamicTableExists(db: any): Promise<boolean> {
  const res: any = await db.execute("SHOW TABLES LIKE 'route_dynamic'");
  const rows = Array.isArray(res) ? res : res.rows || [];
  return rows.length > 0;
}

export async function fetchAllEndpoints(db: any) {
  const res: any = await db.execute('SELECT * FROM route_dynamic ORDER BY created_at DESC');
  return Array.isArray(res) ? res : res.rows || [];
}
