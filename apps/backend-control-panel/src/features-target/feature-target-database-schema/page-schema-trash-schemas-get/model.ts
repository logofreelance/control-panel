/**
 * page-schema-trash-schemas-get/model.ts
 *
 * SQL: Fetch only archived schemas
 * ONLY used by: TrashPage
 */

export async function findArchivedSchemas(db: any) {
  const res: any = await db.execute(
    `SELECT t.*, c.name as category_name
     FROM database_tables t
     LEFT JOIN database_categories c ON t.category_id = c.id
     WHERE t.is_archived = 1
     ORDER BY t.deleted_at DESC`
  );
  return Array.isArray(res) ? (Array.isArray(res[0]) ? res[0] : res) : (res.rows || []);
}
