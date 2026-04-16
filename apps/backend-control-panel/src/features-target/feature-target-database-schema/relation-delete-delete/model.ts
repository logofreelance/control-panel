/**
 * relation-delete-delete/model.ts
 *
 * SQL: DELETE from database_relations by id/local_key/alias
 */

export async function deleteRelation(db: any, rid: string) {
  await db.execute(
    'DELETE FROM database_relations WHERE id = ? OR local_key = ? OR alias = ?',
    [rid, rid, rid]
  );
}
