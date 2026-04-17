/**
 * tables-delete/model.ts
 */

export async function dropTable(db: any, tableName: string) {
    return await db.execute(`DROP TABLE \`${tableName}\``);
}
