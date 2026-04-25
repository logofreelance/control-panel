/**
 * page-editor-endpoint-load-get/handler.ts
 * ROUTE: GET /page-editor/endpoint/:id
 * CONSUMER: useEndpointEditor.ts → init() L152
 */
import { getEndpointById } from './model';

export const handler = async (c: any) => {
  try {
    const db = c.get('targetDb');
    const id = c.req.param('id');
    const data = await getEndpointById(db, id);
    if (!data) return c.json({ status: 'error', message: 'Not found' }, 404);
    return c.json({ status: 'success', data });
  } catch (e: any) {
    return c.json({ status: 'error', message: e.message }, 500);
  }
};
