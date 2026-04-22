/**
 * category-create-post/handler.ts
 */
import { insertCategoryRecord } from './model';

export const handler = async (c: any) => {
  try {
    const db = c.get('targetDb');
    const body = await c.req.json();

    if (!body.name) {
      return c.json({ status: 'error', message: 'Category name is required' }, 400);
    }

    const id = crypto.randomUUID();
    const data = {
      id,
      name: body.name,
      color: body.color,
      icon: body.icon,
      order_index: body.order_index,
    };

    await insertCategoryRecord(db, data);
    return c.json({ status: 'success', data: { id } });
  } catch (err) {
    console.error('[CATEGORY-CREATE-ERROR]', err);
    return c.json({ status: 'error', message: 'Failed to create category' }, 500);
  }
};
