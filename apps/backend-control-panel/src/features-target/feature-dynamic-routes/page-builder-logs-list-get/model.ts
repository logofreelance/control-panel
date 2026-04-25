/**
 * page-builder-logs-list-get/model.ts
 */
export async function getRecentLogs(db: any, limit = 100) {
  const res: any = await db.execute(`SELECT * FROM route_logs ORDER BY created_at DESC LIMIT ${limit}`);
  return Array.isArray(res) ? (Array.isArray(res[0]) ? res[0] : res) : (res.rows || []);
}
