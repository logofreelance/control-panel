/**
 * resource-update-put/handler.ts
 *
 * ALUR: Request param :rid + body → Update endpoint → Return result
 */
import { updateEndpoint } from './model';

export const handler = async (c: any) => {
  try {
    const db = c.get('targetDb');
    const rid = c.req.param('rid');
    const body = await c.req.json();
    const result = await updateEndpoint(db, rid, body);
    return c.json({ status: 'success', data: result });
  } catch (e: any) {
    return c.json({ status: 'error', message: e.message }, 500);
  }
};
