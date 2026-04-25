/**
 * page-builder-logs-list-get/handler.ts
 * ROUTE: GET /page-builder/logs
 * CONSUMER: useRouteBuilder (via MiscController.getLogs)
 */
import { getRecentLogs } from './model';

export const handler = async (c: any) => {
  try {
    const db = c.get('targetDb');
    const data = await getRecentLogs(db);
    return c.json({ status: 'success', data });
  } catch (e: any) {
    return c.json({ status: 'error', message: e.message }, 500);
  }
};
