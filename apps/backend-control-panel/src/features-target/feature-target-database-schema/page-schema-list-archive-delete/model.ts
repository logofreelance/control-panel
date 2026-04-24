/**
 * page-schema-list-archive-delete/model.ts
 * ONLY used by: SchemaListPage (to move to trash)
 */

export async function archiveSchema(db: any, id: string) {
  await db.execute(
    `UPDATE database_tables SET is_archived = 1, deleted_at = NOW() WHERE id = ?`,
    [id]
  );
}
