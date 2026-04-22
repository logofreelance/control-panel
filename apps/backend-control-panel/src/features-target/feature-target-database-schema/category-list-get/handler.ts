/**
 * category-list-get/handler.ts
 */
import { findAllCategories } from './model';

export const handler = async (c: any) => {
  try {
    const db = c.get('targetDb');
    const categories = await findAllCategories(db);
    return c.json({ status: 'success', data: categories });
  } catch (err) {
    console.error('[CATEGORY-LIST-ERROR]', err);
    return c.json({ status: 'error', message: 'Failed to fetch categories' }, 500);
  }
};
