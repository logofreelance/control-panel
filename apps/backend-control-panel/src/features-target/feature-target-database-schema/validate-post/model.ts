/**
 * validate-post/model.ts
 *
 * SQL: Check if table name is available in information_schema
 */

export async function checkTableAvailability(db: any, sanitizedName: string): Promise<{ valid: boolean; finalName: string }> {
  const finalName = `usr_${sanitizedName}`;
  const res: any = await db.execute(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?",
    [finalName]
  );
  const rows = Array.isArray(res) ? res : res.rows || [];
  return { valid: rows.length === 0, finalName };
}
