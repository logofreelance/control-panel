/**
 * schema-detail-get/handler.ts
 *
 * ALUR: Request param :id → Find by ID → Return schema or 404
 */
import { findSchemaById } from './model';

export const handler = async (c: any) => {
  try {
    const db = c.get('targetDb');
    const data = await findSchemaById(db, c.req.param('id'));
    return data
      ? c.json({ status: 'success', data })
      : c.json({ status: 'error', message: 'Not found' }, 404);
  } catch (e: any) {
    return c.json({ status: 'error', message: e.message }, 500);
  }
};
