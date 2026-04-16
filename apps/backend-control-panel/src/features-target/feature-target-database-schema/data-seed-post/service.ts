/**
 * data-seed-post/service.ts
 *
 * ALUR: Find schema → Get columns → Loop insert dummy posts → Return count
 */
import { findSchemaById, getColumnNames, insertSeedRow } from './model';
import { DUMMY_POSTS } from './constants';

export async function executeSeedData(db: any, schemaId: string) {
  // Step 1: Find schema
  const schema = await findSchemaById(db, schemaId);
  if (!schema) return null;

  // Step 2: Get column names from physical table
  const colNames = await getColumnNames(db, schema.table_name);

  // Step 3: Insert each dummy post
  let seededCount = 0;
  for (const post of DUMMY_POSTS) {
    await insertSeedRow(db, schema.table_name, colNames, post);
    seededCount++;
  }

  return seededCount;
}
