/**
 * test-connection-post/logic.ts
 */
import { connect } from '@tidbcloud/serverless';

export async function testDatabaseConnection(databaseUrl: string): Promise<{ ok: boolean; latencyMs: number; error?: string }> {
    const start = Date.now();
    try {
        const httpUrl = databaseUrl.replace('mysql://', 'https://').replace(':4000', '');
        const testDb = connect({ url: httpUrl });
        await testDb.execute('SELECT 1');
        return { ok: true, latencyMs: Date.now() - start };
    } catch (err: any) {
        return { ok: false, latencyMs: Date.now() - start, error: err?.message || 'Connection failed' };
    }
}
