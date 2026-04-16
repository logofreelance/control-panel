/**
 * schema-list-get/model.ts
 *
 * SQL: Select all schemas from database_tables filtered by archive status
 */

export async function findAllSchemas(db: any, isArchived: number) {
  const res: any = await db.execute(
    'SELECT * FROM database_tables WHERE is_archived = ? ORDER BY created_at DESC',
    [isArchived]
  );
  return Array.isArray(res) ? res : res.rows || [];
}
