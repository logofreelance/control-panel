/**
 * page-relation-edit-submit-put/model.ts
 */

export async function updateRelation(db: any, sourceId: string, relationId: string, data: any) {
  const fields = [];
  const values = [];

  const targetId = data.target_id ?? data.targetId;
  if (targetId !== undefined) { fields.push('`target_id` = ?'); values.push(targetId); }

  const relType = data.type ?? data.relationType;
  if (relType !== undefined) { fields.push('`relation_type` = ?'); values.push(relType); }

  const localKey = data.local_key ?? data.localKey;
  if (localKey !== undefined) { fields.push('`local_key` = ?'); values.push(localKey); }

  const foreignKey = data.foreign_key ?? data.foreignKey;
  if (foreignKey !== undefined) { fields.push('`foreign_key` = ?'); values.push(foreignKey); }

  const alias = data.alias;
  if (alias !== undefined) { fields.push('`alias` = ?'); values.push(alias); }

  if (fields.length === 0) return { id: relationId, source_id: sourceId };

  values.push(relationId, sourceId);
  await db.execute(
    `UPDATE database_relations SET ${fields.join(', ')} WHERE id = ? AND source_id = ?`,
    values
  );

  return { id: relationId, source_id: sourceId, ...data };
}
