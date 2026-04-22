/**
 * category-delete-delete/handler.ts
 */
import { deleteCategoryRecord } from './model';

export const handler = async (c: any) => {
  try {
    const db = c.get('targetDb');
    const id = c.req.param('cid');

    await deleteCategoryRecord(db, id);
    return c.json({ status: 'success' });
  } catch (err) {
    console.error('[CATEGORY-DELETE-ERROR]', err);
    return c.json({ status: 'error', message: 'Failed to delete category' }, 500);
  }
};
