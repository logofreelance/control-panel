/**
 * page-data-viewer-columns-get/model.ts
 */

export async function getPhysicalColumns(db: any, tableName: string) {
  const res: any = await db.execute(`DESCRIBE \`${tableName}\``);
  const rows = Array.isArray(res) ? (Array.isArray(res[0]) ? res[0] : res) : (res.rows || []);
  return rows.map((col: any) => ({
    name: col.Field || col.column_name,
    type: col.Type || col.column_type,
    nullable: (col.Null || col.is_nullable) === 'YES',
    isPrimary: (col.Key || col.column_key) === 'PRI',
    default: col.Default || col.column_default,
  }));
}
