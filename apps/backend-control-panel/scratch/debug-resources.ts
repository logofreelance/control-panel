
import { buildInternalDatabaseConnection } from '../src/features-internal/internal.db';
import { findTargetSystemById } from '../src/features-internal/feature-target-registry/target-registry.repository';
import { buildTargetDatabaseConnection } from '../src/features-target/target.db';
import * as dotenv from 'dotenv';
// Load from root env if possible or set manually
process.env.DATABASE_URL_INTERNAL_CONTROL_PANEL = "mysql://root:root@127.0.0.1:3306/engine_control_panel";

async function debug() {
    const id = "d3d2077a-f74e-4a74-9e6d-6f3f3eeacb3e";
    const db = buildInternalDatabaseConnection(process.env.DATABASE_URL_INTERNAL_CONTROL_PANEL);
    const target = await findTargetSystemById(db, id);
    if (!target) {
        console.log("Target not found");
        return;
    }
    console.log("Target found:", target.name);
    const targetDb = buildTargetDatabaseConnection(target.database_url);
    const res: any = await targetDb.execute("SELECT * FROM route_dynamic");
    const rows = Array.isArray(res) ? res : res.rows || [];
    console.log(JSON.stringify(rows.map(r => ({ id: r.id, endpoint: r.endpoint, config: r.handler_config })), null, 2));
}

debug();
