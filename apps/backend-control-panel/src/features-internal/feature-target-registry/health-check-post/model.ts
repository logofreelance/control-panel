/**
 * health-check-post/model.ts
 */
export async function findTargetSystemById(db: any, id: string) {
    const res: any = await db.execute('SELECT * FROM target_systems WHERE id = ?', [id]);
    const rows = Array.isArray(res) ? res : (res.rows || []);
    return rows.length > 0 ? rows[0] : null;
}

export async function updateTargetSystemApiEndpoint(db: any, id: string, apiEndpoint: string): Promise<void> {
    await db.execute('UPDATE target_systems SET api_endpoint = ? WHERE id = ?', [apiEndpoint, id]);
}

export async function updateTargetSystemHealth(db: any, id: string, status: string, routeCount: number): Promise<void> {
    await db.execute(
        'UPDATE target_systems SET status = ?, route_count = ?, last_health_check = NOW() WHERE id = ?',
        [status, routeCount, id]
    );
}
