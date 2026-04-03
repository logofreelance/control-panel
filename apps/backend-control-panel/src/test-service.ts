import { loadEnvironmentConfig } from './env';
import { buildInternalDatabaseConnection } from './features-internal/internal.db';
import { performHealthCheck } from './features-internal/feature-target-registry/target-registry.service';
import { getTargetSystemById } from './features-internal/feature-target-registry/target-registry.service';
import * as fs from 'fs';

async function run() {
    const envConfig = loadEnvironmentConfig();
    const db = buildInternalDatabaseConnection(envConfig.DATABASE_URL_INTERNAL_CONTROL_PANEL);

    try {
        const id = '2dca61d1-bb91-4867-8d8f-616471fd1d42'; // The testing backend 1 id
        const result = await performHealthCheck(db, id);
        const target = await getTargetSystemById(db, id);
        fs.writeFileSync('test-out.txt', JSON.stringify({ result, target }, null, 2));
    } catch (e: any) {
        fs.writeFileSync('test-out.txt', "ERROR: " + e.message);
    }
}
run();
