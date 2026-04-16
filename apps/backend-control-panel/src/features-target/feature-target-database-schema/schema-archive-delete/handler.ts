/**
 * schema-archive-delete/handler.ts
 *
 * ALUR: Request param :id → Set is_archived = 1 → Return success
 */
import { archiveSchema } from './model';

export const handler = async (c: any) => {
  try {
    const db = c.get('targetDb');
    await archiveSchema(db, c.req.param('id'));
    return c.json({ status: 'success', message: 'Archived' });
  } catch (e: any) {
    return c.json({ status: 'error', message: e.message }, 500);
  }
};
