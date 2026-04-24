/**
 * page-relation-create-submit-post/model.ts
 */

export async function createRelation(db: any, sourceId: string, data: any) {
  const id = crypto.randomUUID();
  const res: any = await db.execute(
    `INSERT INTO database_relations 
     (id, source_id, target_id, relation_type, local_key, foreign_key, alias)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      sourceId,
      data.target_id ?? data.targetId,
      data.type ?? 'belongs_to',
      data.local_key ?? data.localKey,
      data.foreign_key ?? data.foreignKey,
      data.alias || ''
    ]
  );
  
  return { id, source_id: sourceId, ...data };
}
