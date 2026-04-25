/**
 * page-error-templates-delete-delete/handler.ts
 * ROUTE: DELETE /page-error-templates/:id
 * CONSUMER: useErrorTemplates.ts → handleDelete() L83
 */
import { deleteErrorTemplate } from './model';

export const handler = async (c: any) => {
  try {
    const db = c.get('targetDb');
    const id = c.req.param('id');
    await deleteErrorTemplate(db, id);
    return c.json({ status: 'success', message: 'Deleted' });
  } catch (e: any) {
    return c.json({ status: 'error', message: e.message }, 500);
  }
};
