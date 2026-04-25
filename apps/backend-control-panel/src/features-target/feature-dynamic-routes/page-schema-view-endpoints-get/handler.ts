/**
 * page-schema-view-endpoints-get/handler.ts
 * ROUTE: GET /page-schema-view/endpoints
 * CONSUMER: DatabaseSchemaView.tsx → EndpointListSection
 * Fetches all endpoints filtered by dataSourceId on the backend side.
 */
import { getEndpointsBySource } from './model';

export const handler = async (c: any) => {
  try {
    const db = c.get('targetDb');
    const data = await getEndpointsBySource(db);
    return c.json({ status: 'success', data });
  } catch (e: any) {
    return c.json({ status: 'error', message: e.message }, 500);
  }
};
