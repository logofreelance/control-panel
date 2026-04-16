/**
 * relation-list-get/model.ts
 *
 * SQL: JOIN database_relations with database_tables to get relations for a schema
 */

export async function findRelationsBySourceId(db: any, sourceId: string) {
  const res: any = await db.execute(
    `SELECT r.*, t.name as target_name, t.table_name as target_table_name
     FROM database_relations r
     LEFT JOIN database_tables t ON r.target_id = t.id
     WHERE r.source_id = ?`,
    [sourceId]
  );
  const rows = Array.isArray(res) ? res : res.rows || [];

  // Map to frontend interface
  return rows.map((r: any) => ({
    id: r.id,
    sourceId: r.source_id,
    targetId: r.target_id,
    type: r.relation_type,
    localKey: r.local_key,
    foreignKey: r.foreign_key,
    pivotTable: r.pivot_table,
    alias: r.alias,
    target: {
      name: r.target_name,
      tableName: r.target_table_name
    }
  }));
}
