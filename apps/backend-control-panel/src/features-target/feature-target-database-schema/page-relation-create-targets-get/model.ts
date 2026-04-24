/**
 * page-relation-create-targets-get/model.ts
 */

export async function getAvailableTargets(db: any, excludeId: string) {
  const res: any = await db.execute(
    `SELECT id, name, table_name FROM database_tables WHERE is_archived = 0 AND id != ?`,
    [excludeId]
  );
  return Array.isArray(res) ? (Array.isArray(res[0]) ? res[0] : res) : (res.rows || []);
}
