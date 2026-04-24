/**
 * page-schema-list-get/model.ts
 *
 * SQL: Fetch active (non-archived) schemas with category join
 * ONLY used by: SchemaListPage
 */

export async function findActiveSchemas(db: any) {
  const res: any = await db.execute(
    `SELECT t.*, c.name as category_name, c.color as category_color, c.icon as category_icon
     FROM database_tables t
     LEFT JOIN database_categories c ON t.category_id = c.id
     WHERE t.is_archived = 0
     ORDER BY t.created_at DESC`
  );
  return Array.isArray(res) ? (Array.isArray(res[0]) ? res[0] : res) : (res.rows || []);
}
