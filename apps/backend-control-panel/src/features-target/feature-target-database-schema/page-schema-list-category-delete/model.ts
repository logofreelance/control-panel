/**
 * page-schema-list-category-delete/model.ts
 * ONLY used by: SchemaListPage category manager
 */

export async function deleteCategory(db: any, id: string) {
  // Unlink category from schemas first
  await db.execute(`UPDATE database_tables SET category_id = NULL WHERE category_id = ?`, [id]);
  await db.execute(`DELETE FROM database_categories WHERE id = ?`, [id]);
}
