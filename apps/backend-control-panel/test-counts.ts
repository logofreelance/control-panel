
import { loadEnvironmentConfig } from './src/env';
import { buildInternalDatabaseConnection } from './src/features-internal/internal.db';
import { buildTargetDatabaseConnection } from './src/features-target/target.db';
import { findTargetSystemById } from './src/features-internal/feature-target-registry/target-registry.repository';

async function test() {
    const env = loadEnvironmentConfig({});
    // Use the hardcoded fallback since it's probably what's running
    if (!env.DATABASE_URL_INTERNAL_CONTROL_PANEL) {
        (env as any).DATABASE_URL_INTERNAL_CONTROL_PANEL = 'mysql://4JnU6pSVxwRM5LU.root:nde9tTv5hnlcYT6n@gateway01.ap-northeast-1.prod.aws.tidbcloud.com:4000/test';
    }

    const internalDb = buildInternalDatabaseConnection(env.DATABASE_URL_INTERNAL_CONTROL_PANEL);
    const targetsRes: any = await internalDb.execute("SELECT id, database_url FROM target_systems LIMIT 1");
    const targets = Array.isArray(targetsRes) ? targetsRes : (targetsRes.rows || []);

    if (targets.length === 0) {
        console.log("No targets found");
        return;
    }

    const target = targets[0];
    const targetId = target.id;
    const targetDb = buildTargetDatabaseConnection(target.database_url);

    console.log(`Testing target: ${targetId}`);

    const queries = {
        users: 'SELECT COUNT(*) as count FROM users',
        routes: 'SELECT COUNT(*) as count FROM route_dynamic',
        api_keys: 'SELECT COUNT(*) as count FROM api_keys',
        logs: 'SELECT COUNT(*) as count FROM route_logs'
    };

    for (const [key, sql] of Object.entries(queries)) {
        try {
            const res: any = await targetDb.execute(sql);
            const rows = Array.isArray(res) ? res : (res.rows || []);
            console.log(`${key}:`, rows[0]);
        } catch (e: any) {
            console.log(`${key}: TABLE MISSING (${e.message})`);
        }
    }
}

test().catch(console.error);
