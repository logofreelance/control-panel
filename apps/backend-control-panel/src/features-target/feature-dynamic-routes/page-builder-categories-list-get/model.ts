/**
 * page-builder-categories-list-get/model.ts
 */
export async function getAllCategories(db: any) {
  const res: any = await db.execute('SELECT * FROM route_categories ORDER BY created_at DESC');
  return Array.isArray(res) ? (Array.isArray(res[0]) ? res[0] : res) : (res.rows || []);
}
