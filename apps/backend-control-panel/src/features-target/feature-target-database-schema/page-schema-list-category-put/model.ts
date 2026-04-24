/**
 * page-schema-list-category-put/model.ts
 * ONLY used by: SchemaListPage category manager
 */

export async function updateCategory(db: any, id: string, name: string, description: string) {
  await db.execute(
    `UPDATE database_categories SET name = ?, description = ? WHERE id = ?`,
    [name, description, id]
  );
}
