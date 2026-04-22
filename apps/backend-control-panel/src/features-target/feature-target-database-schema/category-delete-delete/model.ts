/**
 * category-delete-delete/model.ts
 */

export async function deleteCategoryRecord(db: any, id: string) {
  // First, unset category_id in database_tables
  await db.execute('UPDATE database_tables SET category_id = NULL WHERE category_id = ?', [id]);
  // Then delete the category
  await db.execute('DELETE FROM database_categories WHERE id = ?', [id]);
}
