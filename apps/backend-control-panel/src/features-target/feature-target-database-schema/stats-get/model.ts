/**
 * stats-get/model.ts
 *
 * SQL: Count active schemas from database_tables
 */

export async function countActiveSchemas(db: any): Promise<number> {
  const res: any = await db.execute('SELECT id FROM database_tables WHERE is_archived = 0');
  const rows = Array.isArray(res) ? res : res.rows || [];
  return rows.length;
}
