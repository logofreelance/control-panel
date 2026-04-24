/**
 * schema-update-put/model.ts
 */

export async function updateSchemaRecord(db: any, id: string, data: {
  category_id?: string | null;
  name?: string;
  description?: string;
  display_name?: string;
  schema_json?: string;
  schemaJson?: string; // Support camelCase from frontend
}) {
  const fields = [];
  const params = [];
  
  if (data.category_id !== undefined) { fields.push('category_id = ?'); params.push(data.category_id); }
  
  if (data.name) { 
    fields.push('name = ?'); params.push(data.name);
    // Also update display_name if provided or use name
    fields.push('display_name = ?'); params.push(data.display_name || data.name);
  } else if (data.display_name) {
    fields.push('display_name = ?'); params.push(data.display_name);
  }
  
  if (data.description !== undefined) { fields.push('description = ?'); params.push(data.description); }
  
  // Support both snake_case and camelCase for schema_json
  const schemaJson = data.schema_json || data.schemaJson;
  if (schemaJson !== undefined) {
    fields.push('schema_json = ?');
    params.push(schemaJson);
  }
  
  if (fields.length === 0) return;
  
  params.push(id);
  await db.execute(
    `UPDATE database_tables SET ${fields.join(', ')} WHERE id = ?`,
    params
  );
}
