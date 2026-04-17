/**
 * test-get/model.ts
 */

export async function testConnection(db: any) {
    const res = await db.execute('SELECT 1 as connected, DATABASE() as db');
    return res;
}
