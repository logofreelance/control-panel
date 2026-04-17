/**
 * cleanup-post/model.ts
 */

export async function getAllPhysicalTables(db: any): Promise<string[]> {
    const res: any = await db.execute('SHOW TABLES');
    const rows = Array.isArray(res) ? res : (res.rows || []);
    return rows.map((r: any) => Object.values(r)[0] as string).map(t => t.toLowerCase());
}

export async function getManagedSchemas(db: any): Promise<any[]> {
    const res: any = await db.execute('SELECT id, table_name FROM database_tables');
    return Array.isArray(res) ? res : (res.rows || []);
}

export async function deleteMetadataSchema(db: any, id: string) {
    await db.execute('DELETE FROM database_tables WHERE id = ?', [id]);
}

export async function getManagedRelations(db: any): Promise<any[]> {
    const res: any = await db.execute('SELECT id, source_table, target_table FROM database_relations');
    return Array.isArray(res) ? res : (res.rows || []);
}

export async function deleteMetadataRelation(db: any, id: string) {
    await db.execute('DELETE FROM database_relations WHERE id = ?', [id]);
}
