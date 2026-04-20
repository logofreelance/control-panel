/**
 * relation-create-post/model.ts
 *
 * SQL: INSERT into database_relations
 */
import { randomUUID } from 'node:crypto';

export async function insertRelation(db: any, sourceId: string, body: any) {
  const id = randomUUID();

  const safeTargetId = body.targetId !== undefined ? String(body.targetId) : String(body.target_id);

  await db.execute(
    `INSERT INTO database_relations
     (id, source_id, target_id, relation_type, local_key, foreign_key, pivot_table, alias)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id, 
      String(sourceId), 
      safeTargetId, 
      body.type || body.relation_type,
      body.localKey || body.local_key || null, 
      body.foreignKey || body.foreign_key || 'id',
      body.pivotTable || body.pivot_table || null, 
      body.alias || ''
    ]
  );

  return { id };
}
