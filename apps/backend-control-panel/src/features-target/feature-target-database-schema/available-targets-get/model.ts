/**
 * available-targets-get/model.ts
 *
 * SQL: Select all active schemas except the current one
 */

export async function findAllExcept(db: any, excludeId: string) {
  const res: any = await db.execute(
    'SELECT id, name, table_name FROM database_tables WHERE is_archived = 0 ORDER BY created_at DESC'
  );
  const rows = Array.isArray(res) ? res : res.rows || [];
  return rows
    .filter((s: any) => s.id !== excludeId)
    .map((s: any) => ({ id: s.id, name: s.name, tableName: s.table_name }));
}
