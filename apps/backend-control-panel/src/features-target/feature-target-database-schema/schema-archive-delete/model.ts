/**
 * schema-archive-delete/model.ts
 *
 * SQL: Soft delete schema by setting is_archived = 1
 */

export async function archiveSchema(db: any, id: string) {
  await db.execute('UPDATE database_tables SET is_archived = 1 WHERE id = ?', [id]);
}
