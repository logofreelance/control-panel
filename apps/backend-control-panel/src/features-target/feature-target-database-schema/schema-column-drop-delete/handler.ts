/**
 * schema-column-drop-delete/handler.ts
 */
import { findSchemaById, dropPhysicalColumn } from './model';

export const handler = async (c: any) => {
  try {
    const db = c.get('targetDb');
    const id = c.req.param('id');
    const columnName = c.req.param('name');

    const schema = await findSchemaById(db, id);
    if (!schema) return c.json({ status: 'error', message: 'Schema not found' }, 404);

    await dropPhysicalColumn(db, schema.table_name, columnName);

    return c.json({ status: 'success', message: 'Column dropped successfully' });
  } catch (e: any) {
    return c.json({ status: 'error', message: e.message }, 500);
  }
};
