/**
 * page-relation-create-targets-get/model.ts
 */

export async function getAvailableTargets(db: any, excludeId: string) {
  const res: any = await db.execute(
    `SELECT id, name, table_name FROM database_tables WHERE is_archived = 0 AND id != ?`,
    [excludeId]
  );
  const rawRows = Array.isArray(res) ? (Array.isArray(res[0]) ? res[0] : res) : (res.rows || []);
  
  // Clone to ensure mutability and map to expected frontend structure
  const rows = rawRows.map((r: any) => ({
    id: r.id,
    name: r.name,
    tableName: r.table_name,
    table_name: r.table_name
  }));
  
  // Inject system tables
  if (excludeId !== '0') {
    rows.unshift({
      id: 0,
      name: 'System Users',
      tableName: 'users',
      table_name: 'users'
    });
  }
  
  return rows;
}


