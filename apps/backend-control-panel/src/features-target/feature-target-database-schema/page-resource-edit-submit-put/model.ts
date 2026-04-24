/**
 * page-resource-edit-submit-put/model.ts
 */

export async function updateResource(db: any, tableId: string, resourceId: string, data: any) {
  const fields = [];
  const values = [];

  if (data.name !== undefined) { fields.push('`name` = ?'); values.push(data.name); }
  if (data.slug !== undefined) { fields.push('`slug` = ?'); values.push(data.slug); }
  if (data.description !== undefined) { fields.push('`description` = ?'); values.push(data.description); }
  if (data.fields_json !== undefined) { fields.push('`fields_json` = ?'); values.push(data.fields_json); }
  if (data.filters_json !== undefined) { fields.push('`filters_json` = ?'); values.push(data.filters_json); }
  if (data.relations_json !== undefined) { fields.push('`relations_json` = ?'); values.push(data.relations_json); }
  if (data.order_by !== undefined) { fields.push('`order_by` = ?'); values.push(data.order_by); }
  if (data.order_direction !== undefined) { fields.push('`order_direction` = ?'); values.push(data.order_direction); }
  if (data.default_limit !== undefined) { fields.push('`default_limit` = ?'); values.push(data.default_limit); }
  if (data.max_limit !== undefined) { fields.push('`max_limit` = ?'); values.push(data.max_limit); }
  if (data.is_public !== undefined) { fields.push('`is_public` = ?'); values.push(data.is_public ? 1 : 0); }
  if (data.is_active !== undefined) { fields.push('`is_active` = ?'); values.push(data.is_active ? 1 : 0); }
  if (data.aggregates_json !== undefined) { fields.push('`aggregates_json` = ?'); values.push(data.aggregates_json); }
  if (data.computed_json !== undefined) { fields.push('`computed_json` = ?'); values.push(data.computed_json); }
  if (data.joins_json !== undefined) { fields.push('`joins_json` = ?'); values.push(data.joins_json); }

  if (fields.length === 0) return { id: resourceId, database_table_id: tableId };

  values.push(resourceId, tableId);
  await db.execute(
    `UPDATE database_resources SET ${fields.join(', ')} WHERE id = ? AND database_table_id = ?`,
    values
  );
  
  return { id: resourceId, ...data, database_table_id: tableId };
}
