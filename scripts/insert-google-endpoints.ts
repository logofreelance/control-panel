import { createDb, apiCategories, apiEndpoints, eq } from '@modular/database';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../backend-system/apps/engine/.env') });

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
    console.error("DATABASE_URL not found");
    process.exit(1);
}
const db = createDb(dbUrl);

async function run() {
    try {
        let cats = await db.select().from(apiCategories).where(eq(apiCategories.name, 'Authentication'));
        let catId = cats.length > 0 ? cats[0].id : null;
        if (!catId) {
            const [result] = await db.insert(apiCategories).values({ name: 'Authentication', description: 'Endpoints for managing user authentication and sessions' });
            catId = result.insertId;
        }

        const upsertEndpoint = async (path: string, payload: any) => {
            const existing = await db.select().from(apiEndpoints).where(eq(apiEndpoints.path, path));
            if (existing.length > 0) {
                await db.update(apiEndpoints).set(payload).where(eq(apiEndpoints.id, existing[0].id));
            } else {
                await db.insert(apiEndpoints).values(payload);
            }
        };

        // GOOGLE LOGIN
        await upsertEndpoint('/auth/login/google', {
            path: '/auth/login/google',
            method: 'GET',
            description: 'Starts the Google OAuth flow. Redirects the user to the Google Consent Screen.',
            categoryId: catId, isActive: true, minRoleLevel: 0, operationType: 'read',
            writableFields: JSON.stringify({}),
            responseData: JSON.stringify({
                success: JSON.stringify({ redirect: "string (Google Auth URL)" }, null, 2),
                errors: []
            })
        });

        // GOOGLE CALLBACK
        await upsertEndpoint('/auth/login/google/callback', {
            path: '/auth/login/google/callback',
            method: 'GET',
            description: 'Handles the OAuth callback from Google, registers the user if they do not exist, and creates an active session.',
            categoryId: catId, isActive: true, minRoleLevel: 0, operationType: 'create',
            writableFields: JSON.stringify({
                "Query Params": JSON.stringify({
                    state: "string",
                    code: "string"
                }, null, 2)
            }),
            responseData: JSON.stringify({
                success: JSON.stringify({
                    token: "string (session token)",
                    user: { id: "number", username: "string", email: "string", role: "string" }
                }, null, 2),
                errors: ["Invalid state or code", "Account disabled"]
            })
        });

        console.log("Successfully added Google OAuth endpoints!");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();
