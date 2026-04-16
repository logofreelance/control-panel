/**
 * available-targets-get/handler.ts
 *
 * ALUR: Request param :id → Find all schemas except this one → Return list
 */
import { findAllExcept } from './model';

export const handler = async (c: any) => {
  try {
    const db = c.get('targetDb');
    const tableId = c.req.param('id');
    const data = await findAllExcept(db, tableId);
    return c.json({ status: 'success', data });
  } catch (e: any) {
    return c.json({ status: 'error', message: e.message }, 500);
  }
};
