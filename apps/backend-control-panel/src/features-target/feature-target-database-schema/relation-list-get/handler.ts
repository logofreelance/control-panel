/**
 * relation-list-get/handler.ts
 *
 * ALUR: Request param :id → Fetch relations with join → Return list
 */
import { findRelationsBySourceId } from './model';

export const handler = async (c: any) => {
  try {
    const db = c.get('targetDb');
    const tableId = c.req.param('id');
    const data = await findRelationsBySourceId(db, tableId);
    return c.json({ status: 'success', data });
  } catch (e: any) {
    return c.json({ status: 'error', message: e.message }, 500);
  }
};
