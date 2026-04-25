/**
 * page-builder-api-routes-list-get/handler.ts
 * ROUTE: GET /page-builder/api-routes
 * CONSUMER: useRouteBuilder (via MiscController.getApiRoutes)
 */
import { getAllApiRoutes } from './model';

export const handler = async (c: any) => {
  try {
    const db = c.get('targetDb');
    const routes = await getAllApiRoutes(db);
    return c.json({ status: 'success', data: { routes } });
  } catch (e: any) {
    return c.json({ status: 'error', message: e.message }, 500);
  }
};
