// apps/backend-control-panel/src/main.ts
// ENTRY POINT - Load .env then start server

import * as path from 'path';
import * as dotenv from 'dotenv';

// 1. Load environment variables from root .env
const envPath = path.resolve(__dirname, '../.env');
console.log('[ENV] Loading from:', envPath);
const envResult = dotenv.config({ path: envPath });
if (envResult.error) {
    console.warn('[ENV] Failed to load .env file:', envResult.error.message);
}

// 2. Verify critical env variables are present
const internalDb = process.env.DATABASE_URL_INTERNAL_CONTROL_PANEL;
const targetDb = process.env.DATABASE_URL_TARGET_BACKEND_SYSTEM;
console.log('[ENV] DATABASE_URL_INTERNAL_CONTROL_PANEL:', internalDb ? 'SET' : 'MISSING!');
console.log('[ENV] DATABASE_URL_TARGET_BACKEND_SYSTEM:', targetDb ? 'SET' : 'MISSING!');

// 3. Start the server
import { serve } from '@hono/node-server';

async function main() {
    const { default: app } = await import('./index');

    const port = Number(process.env.ORANGE_PORT) || Number(process.env.PORT) || 3001;
    
    console.log(`[CP-SYSTEM] Control Panel API running on port ${port}`);
    serve({
        fetch: app.fetch,
        port
    });
}

main().catch(console.error);

