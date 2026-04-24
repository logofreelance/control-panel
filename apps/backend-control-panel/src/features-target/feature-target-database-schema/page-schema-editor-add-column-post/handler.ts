/**
 * ═══════════════════════════════════════════════════════════════
 * ROUTE: POST /api/database-schema/page-schema-editor/add-column/:id
 * ═══════════════════════════════════════════════════════════════
 *
 * HANYA digunakan oleh: SchemaEditor
 * Composable: useSchemaEditor()
 * ═══════════════════════════════════════════════════════════════
 */
import { addColumn } from './model';
import { getSchemaDetail } from '../page-schema-editor-detail-get/model';

export const handler = async (c: any) => {
  try {
    const db = c.get('targetDb');
    const id = c.req.param('id');
    const columnDef = await c.req.json();
    
    const schema = await getSchemaDetail(db, id);
    if (!schema) return c.json({ status: 'error', message: 'Not found' }, 404);

    await addColumn(db, schema.table_name, columnDef);
    return c.json({ status: 'success' });
  } catch (e: any) {
    return c.json({ status: 'error', message: e.message }, 500);
  }
};
