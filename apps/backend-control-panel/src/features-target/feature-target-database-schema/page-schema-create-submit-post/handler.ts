/**
 * ═══════════════════════════════════════════════════════════════
 * ROUTE: POST /api/database-schema/page-schema-create/submit
 * ═══════════════════════════════════════════════════════════════
 *
 * HANYA digunakan oleh: CreateSchemaForm
 * Composable: useCreateSchema()
 * ═══════════════════════════════════════════════════════════════
 */
import { randomUUID } from 'node:crypto';
import { executePhysicalCreate, saveSchemaMetadata } from './model';

export const handler = async (c: any) => {
  try {
    const db = c.get('targetDb');
    const body = await c.req.json();
    console.log('[DEBUG-BODY] Received schema submission:', JSON.stringify(body, null, 2));
    const { name, tableName, description, category_id, schema } = body;

    if (!name || !tableName || !schema || !schema.columns) {
      return c.json({ status: 'error', message: 'Missing required fields' }, 400);
    }

    const id = randomUUID();

    // 1. Create physical table
    await executePhysicalCreate(db, tableName, schema);

    // 2. Save metadata
    await saveSchemaMetadata(db, {
      id,
      name,
      tableName,
      description: description || '',
      categoryId: category_id || null,
      schemaJson: JSON.stringify(schema)
    });

    return c.json({ status: 'success', data: { id, name, table_name: tableName } });
  } catch (e: any) {
    console.error('[SCHEMA-SUBMIT-ERROR]', e);
    return c.json({ status: 'error', message: e.message, stack: e.stack }, 500);
  }
};
