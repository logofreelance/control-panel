/**
 * list-get/model.ts
 */
export async function findAllTargetSystemsSafe(db: any) {
    const res: any = await db.execute('SELECT * FROM target_systems ORDER BY created_at DESC');
    const rows = Array.isArray(res) ? res : (res.rows || []);
    return rows.map((row: any) => ({
        id: row.id,
        name: row.name,
        description: row.description || '',
        apiEndpoint: row.api_endpoint || null,
        status: row.status || 'unknown',
        routeCount: row.route_count || 0,
        lastHealthCheck: row.last_health_check,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    }));
}
