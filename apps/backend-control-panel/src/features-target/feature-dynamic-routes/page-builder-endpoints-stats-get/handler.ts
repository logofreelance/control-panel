/**
 * page-builder-endpoints-stats-get/handler.ts
 * ROUTE: GET /page-builder/endpoints/stats
 * CONSUMER: useRouteBuilder.ts → fetchData()
 */
import { getStats } from './model';

export const handler = async (c: any) => {
  try {
    const db = c.get('targetDb');
    const data = await getStats(db);
    return c.json({ status: 'success', data });
  } catch (e: any) {
    return c.json({ status: 'error', message: e.message }, 500);
  }
};
