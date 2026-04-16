/**
 * data-list-get/handler.ts
 *
 * ALUR: Request param :id → Find schema → Fetch rows → Return data
 */
import { findSchemaById, fetchRows } from './model';

export const handler = async (c: any) => {
  try {
    const db = c.get('targetDb');
    const schema = await findSchemaById(db, c.req.param('id'));
    if (!schema) return c.json({ status: 'error', message: 'Not found' }, 404);

    const result = await fetchRows(db, schema.table_name);
    return c.json({ status: 'success', data: result });
  } catch (e: any) {
    return c.json({ status: 'error', message: e.message }, 500);
  }
};
