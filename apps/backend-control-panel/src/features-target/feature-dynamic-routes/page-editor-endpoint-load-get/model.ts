/**
 * page-editor-endpoint-load-get/model.ts
 */
export async function getEndpointById(db: any, id: string) {
  const res: any = await db.execute('SELECT * FROM route_dynamic WHERE id = ?', [id]);
  const rows = Array.isArray(res) ? (Array.isArray(res[0]) ? res[0] : res) : (res.rows || []);
  if (!rows.length) return null;
  const row = rows[0];
  let config = {};
  try { if (row.handler_config) config = JSON.parse(row.handler_config); } catch {}
  return { ...config, ...row, path: row.endpoint, categoryId: row.category_id, isActive: row.is_active === 1 };
}
