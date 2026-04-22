/**
 * category-update-put/model.ts
 */

export async function updateCategoryRecord(db: any, id: string, data: {
  name?: string;
  color?: string;
  icon?: string;
  order_index?: number;
}) {
  const fields = [];
  const params = [];
  
  if (data.name) { fields.push('name = ?'); params.push(data.name); }
  if (data.color !== undefined) { fields.push('color = ?'); params.push(data.color); }
  if (data.icon !== undefined) { fields.push('icon = ?'); params.push(data.icon); }
  if (data.order_index !== undefined) { fields.push('order_index = ?'); params.push(data.order_index); }
  
  if (fields.length === 0) return;
  
  params.push(id);
  await db.execute(
    `UPDATE database_categories SET ${fields.join(', ')} WHERE id = ?`,
    params
  );
}
