/**
 * columns-get/handler.ts
 *
 * ALUR: Request param :id → Find schema → Describe table → Return columns
 */
import { findSchemaById, getPhysicalColumns } from './model';

export const handler = async (c: any) => {
  try {
    const db = c.get('targetDb');
    const id = c.req.param('id');
    
    let tableName = '';
    if (id === '0') {
      tableName = 'users';
    } else {
      const schema = await findSchemaById(db, id);
      if (!schema) return c.json({ status: 'error', message: 'Not found' }, 404);
      tableName = schema.table_name;
    }

    const data = await getPhysicalColumns(db, tableName);
    return c.json({ status: 'success', data });
  } catch (e: any) {
    return c.json({ status: 'error', message: e.message }, 500);
  }
};
