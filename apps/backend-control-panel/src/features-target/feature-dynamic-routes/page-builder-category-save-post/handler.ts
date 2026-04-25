/**
 * page-builder-category-save-post/handler.ts
 * ROUTE: POST /page-builder/category
 * CONSUMER: useRouteBuilder.ts → handleSaveCategory()
 */
import { saveCategory } from './model';

export const handler = async (c: any) => {
  try {
    const db = c.get('targetDb');
    const body = await c.req.json();
    const { id, name, description } = body;

    if (!name || typeof name !== 'string') {
      return c.json({ status: 'error', message: 'name is required and must be string' }, 400);
    }

    const result = await saveCategory(db, id, name, description);
    return c.json({ status: 'success', data: result });
  } catch (e: any) {
    return c.json({ status: 'error', message: e.message }, 500);
  }
};
