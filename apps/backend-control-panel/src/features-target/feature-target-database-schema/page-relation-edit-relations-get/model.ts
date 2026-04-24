/**
 * page-relation-edit-relations-get/model.ts
 */

export async function getRelations(db: any, tableId: string) {
  const res: any = await db.execute(
    `SELECT r.*, t.name as target_table_display_name, t.table_name as target_table_name 
     FROM database_relations r
     LEFT JOIN database_tables t ON r.target_id = t.id
     WHERE r.source_id = ?`,
    [tableId]
  );
  const rows = Array.isArray(res) ? (Array.isArray(res[0]) ? res[0] : res) : (res.rows || []);
  return rows.map((r: any) => ({
    id: r.id,
    sourceId: r.source_id,
    targetId: r.target_id,
    type: r.relation_type,
    localKey: r.local_key,
    foreignKey: r.foreign_key,
    pivotTable: null,
    alias: '',
    target: {
      name: r.target_table_display_name,
      tableName: r.target_table_name
    }
  }));
}
