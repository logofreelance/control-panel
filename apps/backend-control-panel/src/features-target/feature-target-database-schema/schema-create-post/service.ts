/**
 * schema-create-post/service.ts
 *
 * ALUR: Parse body → Create physical table (if schema) → Insert metadata → Return id
 */
import { randomUUID } from 'node:crypto';
import { createPhysicalTable, insertSchemaRecord } from './model';

export async function executeCreateSchema(db: any, body: any) {
  const id = randomUUID();
  const tableName = body.tableName || body.table_name || body.name;

  // Step 1: Create physical table if schema columns provided
  if (body.schema && Array.isArray(body.schema.columns)) {
    await createPhysicalTable(db, tableName, body.schema.columns, {
      timestamps: body.schema.timestamps,
      softDelete: body.schema.softDelete
    });
  }

  // Step 2: Insert metadata record
  await insertSchemaRecord(db, {
    id,
    name: body.name || tableName,
    table_name: tableName,
    description: body.description || '',
    connection_config: JSON.stringify(body.connection_config || {})
  });

  return { id };
}
