/**
 * columns-get/handler.ts
 *
 * ALUR: Request param :id → Find schema → Describe table → Return columns
 */
import { findSchemaById, getPhysicalColumns } from './model';

export const handler = async (c: any) => {
  try {
    const db = c.get('targetDb');
    const schema = await findSchemaById(db, c.req.param('id'));
    if (!schema) return c.json({ status: 'error', message: 'Not found' }, 404);

    const data = await getPhysicalColumns(db, schema.table_name);
    return c.json({ status: 'success', data });
  } catch (e: any) {
    return c.json({ status: 'error', message: e.message }, 500);
  }
};
