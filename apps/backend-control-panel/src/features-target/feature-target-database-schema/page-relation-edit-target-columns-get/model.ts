/**
 * page-relation-edit-target-columns-get/model.ts
 */

export async function getColumns(db: any, tableName: string) {
  try {
    const res: any = await db.execute(`DESCRIBE \`${tableName}\``);
    const rows = Array.isArray(res) ? (Array.isArray(res[0]) ? res[0] : res) : (res.rows || []);
    return rows.map((col: any) => ({
      name: col.Field || col.column_name,
      type: col.Type || col.column_type
    }));
  } catch {
    return [];
  }
}

export async function getSchemaInfo(db: any, id: string) {
  const res: any = await db.execute(`SELECT id, name, table_name FROM database_tables WHERE id = ?`, [id]);
  const rows = Array.isArray(res) ? (Array.isArray(res[0]) ? res[0] : res) : (res.rows || []);
  return rows.length > 0 ? rows[0] : null;
}
