/**
 * page-editor-endpoints-check-duplicate-get/handler.ts
 * ROUTE: GET /page-editor/endpoints/check-duplicate
 * CONSUMER: useEndpointEditor.ts → checkDuplicate() L210
 */
import { getAllEndpointsForCheck } from './model';

export const handler = async (c: any) => {
  try {
    const db = c.get('targetDb');
    const data = await getAllEndpointsForCheck(db);
    return c.json({ status: 'success', data });
  } catch (e: any) {
    return c.json({ status: 'error', message: e.message }, 500);
  }
};
