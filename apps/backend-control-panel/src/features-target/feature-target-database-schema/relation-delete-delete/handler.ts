/**
 * relation-delete-delete/handler.ts
 *
 * ALUR: Request param :rid → Delete relation → Return success
 */
import { deleteRelation } from './model';

export const handler = async (c: any) => {
  try {
    const db = c.get('targetDb');
    const rid = c.req.param('rid');
    await deleteRelation(db, rid);
    return c.json({ status: 'success', message: 'Deleted' });
  } catch (e: any) {
    return c.json({ status: 'error', message: e.message }, 500);
  }
};
