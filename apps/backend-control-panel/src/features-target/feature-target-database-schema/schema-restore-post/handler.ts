/**
 * schema-restore-post/handler.ts
 *
 * ALUR: Request param :id → Set is_archived = 0 → Return success
 */
import { restoreSchema } from './model';

export const handler = async (c: any) => {
  try {
    const db = c.get('targetDb');
    await restoreSchema(db, c.req.param('id'));
    return c.json({ status: 'success', message: 'Restored' });
  } catch (e: any) {
    return c.json({ status: 'error', message: e.message }, 500);
  }
};
