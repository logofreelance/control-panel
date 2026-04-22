/**
 * schema-list-get/model.ts
 *
 * SQL: Select all schemas from database_tables filtered by archive status
 */

export async function findAllSchemas(db: any, isArchived: number) {
  const res: any = await db.execute(
    `SELECT t.*, c.name as category_name, c.color as category_color, c.icon as category_icon 
     FROM database_tables t
     LEFT JOIN database_categories c ON t.category_id = c.id
     WHERE t.is_archived = ? 
     ORDER BY t.created_at DESC`,
    [isArchived]
  );
  return Array.isArray(res) ? res : res.rows || [];
}
