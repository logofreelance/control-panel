/**
 * page-schema-view-endpoints-get/model.ts
 */
export async function getEndpointsBySource(db: any) {
  const res: any = await db.execute('SELECT * FROM route_dynamic ORDER BY created_at DESC');
  const rows = Array.isArray(res) ? (Array.isArray(res[0]) ? res[0] : res) : (res.rows || []);
  return rows.map((row: any) => {
    let config = {};
    try { if (row.handler_config) config = JSON.parse(row.handler_config); } catch {}
    return { ...config, ...row, path: row.endpoint, categoryId: row.category_id, isActive: row.is_active === 1 };
  });
}
