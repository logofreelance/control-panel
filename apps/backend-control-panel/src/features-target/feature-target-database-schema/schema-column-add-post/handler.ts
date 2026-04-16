/**
 * schema-column-add-post/handler.ts
 */
import { findSchemaById, addPhysicalColumn } from './model';

export const handler = async (c: any) => {
  try {
    const db = c.get('targetDb');
    const id = c.req.param('id');
    const column = await c.req.json();

    const schema = await findSchemaById(db, id);
    if (!schema) return c.json({ status: 'error', message: 'Schema not found' }, 404);

    await addPhysicalColumn(db, schema.table_name, column);

    return c.json({ status: 'success', message: 'Column added successfully' });
  } catch (e: any) {
    return c.json({ status: 'error', message: e.message }, 500);
  }
};
