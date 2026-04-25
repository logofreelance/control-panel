/**
 * page-builder-categories-list-get/handler.ts
 * ROUTE: GET /page-builder/categories
 * CONSUMER: useRouteBuilder.ts → fetchData()
 */
import { getAllCategories } from './model';

export const handler = async (c: any) => {
  try {
    const db = c.get('targetDb');
    const data = await getAllCategories(db);
    return c.json({ status: 'success', data });
  } catch (e: any) {
    return c.json({ status: 'error', message: e.message }, 500);
  }
};
