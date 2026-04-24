/**
 * page-schema-editor-update-put/model.ts
 */

export async function updateSchemaMetadata(db: any, id: string, data: any) {
  const fields = [];
  const values = [];
  
  if (data.name !== undefined) {
    fields.push('`name` = ?');
    values.push(data.name);
  }
  if (data.description !== undefined) {
    fields.push('`description` = ?');
    values.push(data.description);
  }
  if (data.category_id !== undefined) {
    fields.push('`category_id` = ?');
    values.push(data.category_id);
  }
  if (data.schema_json !== undefined || data.schemaJson !== undefined) {
    fields.push('`schema_json` = ?');
    values.push(data.schema_json ?? data.schemaJson);
  }
  
  if (fields.length === 0) return;
  
  values.push(id);
  await db.execute(
    `UPDATE database_tables SET ${fields.join(', ')} WHERE id = ?`,
    values
  );
}
