/**
 * page-data-viewer-rows-get/model.ts
 */

export async function getRows(db: any, tableName: string, page: number, limit: number, sortBy: string, sortDir: string) {
  const offset = (page - 1) * limit;
  const validSortDir = sortDir.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
  
  // Basic query, no join for simple data viewer
  const res: any = await db.execute(
    `SELECT * FROM \`${tableName}\` ORDER BY \`${sortBy}\` ${validSortDir} LIMIT ? OFFSET ?`,
    [limit, offset]
  );
  return Array.isArray(res) ? (Array.isArray(res[0]) ? res[0] : res) : (res.rows || []);
}

export async function getTotalCount(db: any, tableName: string) {
  const res: any = await db.execute(`SELECT COUNT(*) as total FROM \`${tableName}\``);
  const rows = Array.isArray(res) ? (Array.isArray(res[0]) ? res[0] : res) : (res.rows || []);
  return rows.length > 0 ? Number(rows[0].total || rows[0]['COUNT(*)']) : 0;
}
