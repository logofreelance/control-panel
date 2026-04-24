/**
 * page-schema-trash-restore-post/model.ts
 * ONLY used by: TrashPage
 */

export async function restoreSchema(db: any, id: string) {
  await db.execute(
    `UPDATE database_tables SET is_archived = 0, deleted_at = NULL WHERE id = ?`,
    [id]
  );
}
