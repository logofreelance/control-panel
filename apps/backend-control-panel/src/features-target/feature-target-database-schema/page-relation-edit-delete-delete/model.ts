/**
 * page-relation-edit-delete-delete/model.ts
 */

export async function deleteRelation(db: any, sourceId: string, relationId: string) {
  await db.execute(
    `DELETE FROM database_relations WHERE id = ? AND source_id = ?`,
    [relationId, sourceId]
  );
}
