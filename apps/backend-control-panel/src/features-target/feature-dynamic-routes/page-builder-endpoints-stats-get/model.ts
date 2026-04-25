/**
 * page-builder-endpoints-stats-get/model.ts
 */
export async function getStats(db: any) {
  const totalRes: any = await db.execute('SELECT COUNT(*) as total FROM route_dynamic');
  const activeRes: any = await db.execute('SELECT COUNT(*) as active FROM route_dynamic WHERE is_active = 1');
  const totalRows = Array.isArray(totalRes) ? (Array.isArray(totalRes[0]) ? totalRes[0] : totalRes) : (totalRes.rows || []);
  const activeRows = Array.isArray(activeRes) ? (Array.isArray(activeRes[0]) ? activeRes[0] : activeRes) : (activeRes.rows || []);
  return { total: totalRows[0]?.total || 0, active: activeRows[0]?.active || 0 };
}
