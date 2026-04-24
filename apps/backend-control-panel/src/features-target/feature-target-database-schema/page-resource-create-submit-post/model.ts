/**
 * page-resource-create-submit-post/model.ts
 */

export async function createResource(db: any, tableId: string, data: any) {
  const res: any = await db.execute(
    `INSERT INTO database_resources 
     (database_table_id, name, slug, description, fields_json, filters_json, relations_json, 
      order_by, order_direction, default_limit, max_limit, is_public, is_active, 
      aggregates_json, computed_json, joins_json)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      tableId,
      data.name,
      data.slug,
      data.description || null,
      data.fields_json || '[]',
      data.filters_json || '[]',
      data.relations_json || '[]',
      data.order_by || 'id',
      data.order_direction || 'DESC',
      data.default_limit || 10,
      data.max_limit || 100,
      data.is_public ? 1 : 0,
      data.is_active !== false ? 1 : 0,
      data.aggregates_json || '[]',
      data.computed_json || '[]',
      data.joins_json || '[]'
    ]
  );
  
  const insertId = res.insertId || res[0]?.insertId;
  return { id: insertId, ...data, database_table_id: tableId };
}
