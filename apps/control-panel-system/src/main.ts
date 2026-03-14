// apps/control-panel-system/src/main.ts
// CRITICAL: dotenv and driver registration must happen BEFORE app import

import * as path from 'path';
import * as dotenv from 'dotenv';
const envPath = path.resolve(__dirname, '../../../.env');
console.log('[DEBUG ROOT ENV PATH]:', envPath);
const envResult = dotenv.config({ path: envPath });
console.log('[DEBUG DOTENV RESULT]:', envResult.error ? 'ERROR' : 'SUCCESS', envResult.parsed ? 'HAS KEYS' : 'NO KEYS');

// 2. Setup ENV drivers
// MUST IMPORT FROM @cp/config TO MAINTAIN SINGLETON INSTANCE
import { EnvCore } from '@cp/config';
import { GitHubEnvDriver } from '@modular/driver-env-github';
import { serve } from '@hono/node-server';

// Initialize environment BEFORE app loads
const envCore = EnvCore.getInstance();
if (envCore.getStatus().drivers.length === 0) {
    envCore.registerDriver(new GitHubEnvDriver());
}
console.log('[DEBUG DATABASE URL]:', envCore.get('DATABASE_URL') ? 'EXISTS' : 'UNDEFINED');
console.log('[DEBUG RAW PROCESS.ENV]:', process.env.DATABASE_URL ? 'EXISTS' : 'UNDEFINED');

// 3. Dynamic import for app (ensures drivers are registered first)
async function main() {
    const { default: app } = await import('./index');

    const port = Number(envCore.getRaw('PORT')) || 3000;
    
    console.log(`[CP-SYSTEM] Control Panel API running on port ${port}`);
    serve({
        fetch: app.fetch,
        port
    });
}

main().catch(console.error);
