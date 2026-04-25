/**
 * page-editor-endpoint-delete-delete/handler.ts
 * ROUTE: DELETE /page-editor/endpoint/:id
 * CONSUMER: useEndpointEditor.ts → executeDelete() L289
 */
import { deleteEndpoint } from './model';

export const handler = async (c: any) => {
  try {
    const db = c.get('targetDb');
    const id = c.req.param('id');
    await deleteEndpoint(db, id);
    return c.json({ status: 'success' });
  } catch (e: any) {
    return c.json({ status: 'error', message: e.message }, 500);
  }
};
