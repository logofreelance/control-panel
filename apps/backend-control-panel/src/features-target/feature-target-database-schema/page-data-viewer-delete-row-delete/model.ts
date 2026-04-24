/**
 * page-data-viewer-delete-row-delete/model.ts
 */

export async function deleteRow(db: any, tableName: string, rowId: string) {
  // Try hard delete
  try {
    await db.execute(`DELETE FROM \`${tableName}\` WHERE id = ?`, [rowId]);
  } catch (err: any) {
    // If it fails (maybe due to constraints), try soft delete if soft delete column exists
    try {
      await db.execute(`UPDATE \`${tableName}\` SET deleted_at = NOW() WHERE id = ?`, [rowId]);
    } catch {
      throw err; // throw original error if soft delete also fails
    }
  }
}
