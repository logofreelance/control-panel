/**
 * schema-restore-post/model.ts
 *
 * SQL: Restore schema by setting is_archived = 0
 */

export async function restoreSchema(db: any, id: string) {
  await db.execute('UPDATE database_tables SET is_archived = 0 WHERE id = ?', [id]);
}
