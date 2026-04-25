/**
 * page-detail-endpoint-load-get/handler.ts
 * ROUTE: GET /page-detail/endpoint/:id
 * CONSUMER: useEndpointDetail.ts → fetchEndpoint() L36
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
