/**
 * page-schema-list-category-post/model.ts
 *
 * SQL: Insert new category
 * ONLY used by: SchemaListPage category manager
 */

export async function insertCategory(db: any, id: string, name: string, description: string) {
  await db.execute(
    `INSERT INTO database_categories (id, name, description) VALUES (?, ?, ?)`,
    [id, name, description]
  );
}
