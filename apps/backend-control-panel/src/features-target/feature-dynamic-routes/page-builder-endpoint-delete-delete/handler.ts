/**
 * page-builder-endpoint-delete-delete/handler.ts
 * ROUTE: DELETE /page-builder/endpoint/:id
 * CONSUMER: useRouteBuilder.ts → executeDelete()
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
