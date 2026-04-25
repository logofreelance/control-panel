/**
 * page-builder-category-delete-delete/model.ts
 */
export async function deleteCategory(db: any, id: string) {
  await db.execute('DELETE FROM route_categories WHERE id = ?', [id]);
}
