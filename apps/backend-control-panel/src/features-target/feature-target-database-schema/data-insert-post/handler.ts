/**
 * data-insert-post/handler.ts
 *
 * ALUR: Request param :id + body → Find schema → Insert row → Return id
 */
import { findSchemaById, insertRow } from './model';

export const handler = async (c: any) => {
  try {
    const db = c.get('targetDb');
    const schema = await findSchemaById(db, c.req.param('id'));
    if (!schema) return c.json({ status: 'error', message: 'Not found' }, 404);

    const body = await c.req.json();
    const result = await insertRow(db, schema.table_name, body);
    return c.json({ status: 'success', data: result });
  } catch (e: any) {
    return c.json({ status: 'error', message: e.message }, 500);
  }
};
