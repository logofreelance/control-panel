/**
 * page-builder-endpoints-list-get/handler.ts
 * ROUTE: GET /page-builder/endpoints
 * CONSUMER: useRouteBuilder.ts → fetchData()
 */
import { getAllEndpoints } from './model';

export const handler = async (c: any) => {
  try {
    const db = c.get('targetDb');
    const data = await getAllEndpoints(db);
    return c.json({ status: 'success', data });
  } catch (e: any) {
    return c.json({ status: 'error', message: e.message }, 500);
  }
};
