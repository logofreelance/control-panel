/**
 * relation-create-post/model.ts
 *
 * SQL: INSERT into database_relations
 */
import { randomUUID } from 'node:crypto';

export async function insertRelation(db: any, sourceId: string, body: any) {
  const id = randomUUID();

  await db.execute(
    `INSERT INTO database_relations
     (id, source_id, target_id, relation_type, local_key, foreign_key, pivot_table, alias)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id, sourceId, body.targetId, body.type,
      body.localKey || null, body.foreignKey || 'id',
      body.pivotTable || null, body.alias || ''
    ]
  );

  return { id };
}
