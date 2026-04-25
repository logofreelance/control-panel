/**
 * page-builder-endpoint-toggle-put/handler.ts
 * ROUTE: PUT /page-builder/endpoint/:id/toggle
 * CONSUMER: useRouteBuilder.ts → handleToggleEndpoint()
 */
import { toggleEndpoint } from './model';

export const handler = async (c: any) => {
  try {
    const db = c.get('targetDb');
    const id = c.req.param('id');
    const { is_active } = await c.req.json();
    await toggleEndpoint(db, id, is_active);
    return c.json({ status: 'success' });
  } catch (e: any) {
    return c.json({ status: 'error', message: e.message }, 500);
  }
};
