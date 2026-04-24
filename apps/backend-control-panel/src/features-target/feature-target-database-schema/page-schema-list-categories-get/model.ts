/**
 * page-schema-list-categories-get/model.ts
 *
 * SQL: Fetch all categories
 * ONLY used by: SchemaListPage category filter
 */

export async function findAllCategories(db: any) {
  const res: any = await db.execute(
    `SELECT * FROM database_categories ORDER BY order_index ASC, created_at ASC`
  );
  return Array.isArray(res) ? (Array.isArray(res[0]) ? res[0] : res) : (res.rows || []);
}
