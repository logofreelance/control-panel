/**
 * page-editor-categories-dropdown-get/handler.ts
 * ROUTE: GET /page-editor/categories
 * CONSUMER: useEndpointEditor.ts → init() L124
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
