/**
 * page-editor-endpoints-check-duplicate-get/model.ts
 */
export async function getAllEndpointsForCheck(db: any) {
  const res: any = await db.execute('SELECT id, endpoint, method FROM route_dynamic');
  const rows = Array.isArray(res) ? (Array.isArray(res[0]) ? res[0] : res) : (res.rows || []);
  return rows.map((r: any) => ({ id: r.id, endpoint: r.endpoint, path: r.endpoint, method: r.method }));
}
