/**
 * page-schema-list-resource-delete/model.ts
 */

export async function deleteResource(db: any, tableId: string, resourceId: string) {
  await db.execute(
    `DELETE FROM database_resources WHERE id = ? AND database_table_id = ?`,
    [resourceId, tableId]
  );
}
