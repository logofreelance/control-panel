/**
 * page-data-viewer-import-bulk-post/model.ts
 */
import { insertRow } from '../page-data-viewer-insert-row-post/model';

export async function importRowsBulk(db: any, tableName: string, rows: any[]) {
  let count = 0;
  for (const row of rows) {
    try {
      await insertRow(db, tableName, row);
      count++;
    } catch (e) {
      console.error(`Failed to insert row in ${tableName}:`, e);
    }
  }
  return count;
}
