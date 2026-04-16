/**
 * resource-delete-delete/handler.ts
 *
 * ALUR: Request param :rid → Delete from route_dynamic → Return success
 */
import { deleteEndpoint } from './model';

export const handler = async (c: any) => {
  try {
    const db = c.get('targetDb');
    const rid = c.req.param('rid');
    await deleteEndpoint(db, rid);
    return c.json({ status: 'success', message: 'Deleted' });
  } catch (e: any) {
    return c.json({ status: 'error', message: e.message }, 500);
  }
};
