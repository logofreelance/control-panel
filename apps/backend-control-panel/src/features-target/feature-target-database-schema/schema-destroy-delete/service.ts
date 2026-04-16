/**
 * schema-destroy-delete/service.ts
 *
 * ALUR: Find schema → Drop physical table → Delete record
 */
import { findSchemaById, dropPhysicalTable, deleteSchemaRecord } from './model';

export async function executeDestroySchema(db: any, id: string) {
  // Step 1: Find schema to get table_name
  const schema = await findSchemaById(db, id);

  // Step 2: Drop physical table if schema exists
  if (schema) {
    await dropPhysicalTable(db, schema.table_name);
  }

  // Step 3: Delete metadata record
  await deleteSchemaRecord(db, id);
}
