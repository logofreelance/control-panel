/**
 * category-update-put/handler.ts
 */
import { updateCategoryRecord } from './model';

export const handler = async (c: any) => {
  try {
    const db = c.get('targetDb');
    const id = c.req.param('cid');
    const body = await c.req.json();

    await updateCategoryRecord(db, id, body);
    return c.json({ status: 'success' });
  } catch (err) {
    console.error('[CATEGORY-UPDATE-ERROR]', err);
    return c.json({ status: 'error', message: 'Failed to update category' }, 500);
  }
};
