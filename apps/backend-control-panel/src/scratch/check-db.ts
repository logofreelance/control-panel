
import { buildTargetDatabaseConnection } from './features-target/target.db';
import { loadEnvironmentConfig } from './env';

async function check() {
    const env = loadEnvironmentConfig();
    const dbUrl = env.DATABASE_URL_INTERNAL_CONTROL_PANEL; // Just to get something, but we need target db
    // Actually, I'll just check what the middleware does.
}
