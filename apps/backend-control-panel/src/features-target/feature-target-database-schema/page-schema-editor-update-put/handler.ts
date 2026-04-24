/**
 * ═══════════════════════════════════════════════════════════════
 * ROUTE: PUT /api/database-schema/page-schema-editor/update/:id
 * ═══════════════════════════════════════════════════════════════
 *
 * HANYA digunakan oleh: SchemaEditor
 * Composable: useSchemaActions()
 * ═══════════════════════════════════════════════════════════════
 */
import { updateSchemaMetadata } from './model';

export const handler = async (c: any) => {
  try {
    const db = c.get('targetDb');
    const id = c.req.param('id');
    const body = await c.req.json();
    
    await updateSchemaMetadata(db, id, body);
    return c.json({ status: 'success' });
  } catch (e: any) {
    return c.json({ status: 'error', message: e.message }, 500);
  }
};
