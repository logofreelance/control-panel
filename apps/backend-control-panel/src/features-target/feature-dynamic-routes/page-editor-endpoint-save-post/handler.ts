/**
 * page-editor-endpoint-save-post/handler.ts
 * ROUTE: POST /page-editor/endpoint
 * CONSUMER: useEndpointEditor.ts → handleSave() L263
 */
import { saveEndpoint } from './model';

export const handler = async (c: any) => {
  try {
    const db = c.get('targetDb');
    const body = await c.req.json();
    const result = await saveEndpoint(db, body);
    return c.json({ status: 'success', data: result });
  } catch (e: any) {
    return c.json({ status: 'error', message: e.message }, 500);
  }
};
