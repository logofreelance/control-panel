/**
 * page-builder-category-delete-delete/handler.ts
 * ROUTE: DELETE /page-builder/category/:id
 * CONSUMER: useRouteBuilder.ts → executeDelete()
 */
import { deleteCategory } from './model';

export const handler = async (c: any) => {
  try {
    const db = c.get('targetDb');
    const id = c.req.param('id');
    await deleteCategory(db, id);
    return c.json({ status: 'success' });
  } catch (e: any) {
    return c.json({ status: 'error', message: e.message }, 500);
  }
};
