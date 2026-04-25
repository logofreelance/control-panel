/**
 * page-error-templates-list-get/handler.ts
 * ROUTE: GET /page-error-templates/list
 * CONSUMER: useErrorTemplates.ts → fetchTemplates() L31
 */
import { getAllErrorTemplates } from './model';

export const handler = async (c: any) => {
  try {
    const db = c.get('targetDb');
    const data = await getAllErrorTemplates(db);
    return c.json({ status: 'success', data });
  } catch (e: any) {
    return c.json({ status: 'error', message: e.message }, 500);
  }
};
