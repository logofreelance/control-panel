/**
 * page-builder-api-routes-list-get/model.ts
 */
export async function getAllApiRoutes(db: any) {
  const res: any = await db.execute('SELECT id, route_path as path, method, handler, description, metadata, created_at FROM route_core');
  return Array.isArray(res) ? (Array.isArray(res[0]) ? res[0] : res) : (res.rows || []);
}
