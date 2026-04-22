/**
 * category-create-post/model.ts
 */

export async function insertCategoryRecord(db: any, data: {
  id: string;
  name: string;
  color?: string;
  icon?: string;
  order_index?: number;
}) {
  await db.execute(
    'INSERT INTO database_categories (id, name, color, icon, order_index) VALUES (?, ?, ?, ?, ?)',
    [data.id, data.name, data.color || null, data.icon || null, data.order_index || 0]
  );
}
