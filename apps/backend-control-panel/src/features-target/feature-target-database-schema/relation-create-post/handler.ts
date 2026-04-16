/**
 * relation-create-post/handler.ts
 *
 * ALUR: Request param :id + body → Insert relation → Return id
 */
import { insertRelation } from './model';

export const handler = async (c: any) => {
  try {
    const db = c.get('targetDb');
    const tableId = c.req.param('id');
    const body = await c.req.json();
    const result = await insertRelation(db, tableId, body);
    return c.json({ status: 'success', data: result });
  } catch (e: any) {
    return c.json({ status: 'error', message: e.message }, 500);
  }
};
