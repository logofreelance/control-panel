/**
 * category-list-get/model.ts
 */

export async function findAllCategories(db: any) {
  const res: any = await db.execute(
    'SELECT * FROM database_categories ORDER BY order_index ASC, name ASC'
  );
  return Array.isArray(res) ? res : res.rows || [];
}
