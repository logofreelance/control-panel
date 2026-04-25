/**
 * page-error-templates-save-post/handler.ts
 * ROUTE: POST /page-error-templates/save
 * CONSUMER: useErrorTemplates.ts → handleSave() L54
 */
import { saveErrorTemplate } from './model';

export const handler = async (c: any) => {
  try {
    const db = c.get('targetDb');
    const body = await c.req.json();
    const result = await saveErrorTemplate(db, body);
    return c.json({ status: 'success', data: result });
  } catch (e: any) {
    return c.json({ status: 'error', message: e.message }, 500);
  }
};
