/**
 * resource-create-post/handler.ts
 *
 * ALUR: Request param :id + body → Insert endpoint → Return result
 */
import { insertEndpoint } from './model';

export const handler = async (c: any) => {
  try {
    const db = c.get('targetDb');
    const tableId = c.req.param('id');
    const body = await c.req.json();
    const result = await insertEndpoint(db, tableId, body);
    return c.json({ status: 'success', data: result });
  } catch (e: any) {
    return c.json({ status: 'error', message: e.message }, 500);
  }
};
