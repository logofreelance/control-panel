/**
 * create-post/model.ts
 */
export async function createTargetSystem(db: any, id: string, name: string, description: string, databaseUrl: string, apiEndpoint: string | null): Promise<void> {
    await db.execute(
        'INSERT INTO target_systems (id, name, description, database_url, api_endpoint) VALUES (?, ?, ?, ?, ?)',
        [id, name, description, databaseUrl, apiEndpoint]
    );
}

export async function findTargetSystemByIdFullSafe(db: any, id: string) {
    const res: any = await db.execute('SELECT * FROM target_systems WHERE id = ?', [id]);
    const rows = Array.isArray(res) ? res : (res.rows || []);
    if (rows.length === 0) return null;
    const row = rows[0] as any;
    
    let safeDbUrl = '****';
    try {
        const parsed = new URL(row.database_url.replace('mysql://', 'https://'));
        if (parsed.password) parsed.password = '****';
        safeDbUrl = parsed.toString().replace('https://', 'mysql://');
    } catch {}

    return {
        id: row.id, name: row.name, description: row.description || '', apiEndpoint: row.api_endpoint || null,
        status: row.status || 'unknown', routeCount: row.route_count || 0,
        lastHealthCheck: row.last_health_check, createdAt: row.created_at, updatedAt: row.updated_at,
        databaseUrl: safeDbUrl
    };
}
