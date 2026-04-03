import { createDb, apiCategories, apiEndpoints, eq } from '@modular/database';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env from backend-system
dotenv.config({ path: path.join(__dirname, '../../backend-system/apps/engine/.env') });

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
    console.error("DATABASE_URL not found");
    process.exit(1);
}

const db = createDb(dbUrl);

async function run() {
    try {
        console.log("Checking categories for 'Authentication'...");
        let cats = await db.select().from(apiCategories).where(eq(apiCategories.name, 'Authentication'));
        let catId = cats.length > 0 ? cats[0].id : null;

        if (!catId) {
            console.log("Category 'Authentication' not found, creating it...");
            const [result] = await db.insert(apiCategories).values({
                name: 'Authentication',
                description: 'Endpoints for managing user authentication and sessions',
            });
            catId = result.insertId;
        }

        console.log("Checking if '/auth/register' endpoint exists...");
        const existing = await db.select().from(apiEndpoints).where(eq(apiEndpoints.path, '/auth/register'));

        const payloadInfo = JSON.stringify({
            username: "string (required, min 3 chars)",
            email: "string (required, valid email)",
            password: "string (required, min 8 chars)"
        }, null, 2);

        const responseSuccess = JSON.stringify({
            token: "string (session token)",
            user: {
                id: "number",
                username: "string",
                email: "string",
                role: "string"
            }
        }, null, 2);

        const payload = {
            path: '/auth/register',
            method: 'POST',
            description: 'Register a new user account and receive an active session token.',
            categoryId: catId,
            isActive: true,
            minRoleLevel: 0, // Public
            operationType: 'create',
            writableFields: JSON.stringify({
                "Content-Type": "application/json",
                body: payloadInfo
            }),
            responseData: JSON.stringify({
                success: responseSuccess,
                errors: [
                    "Missing fields: username, email, or password",
                    "Email or Username already taken",
                    "Password too short"
                ]
            })
        };

        if (existing.length > 0) {
            console.log("Endpoint already exists, updating...");
            await db.update(apiEndpoints).set(payload).where(eq(apiEndpoints.id, existing[0].id));
        } else {
            console.log("Endpoint does not exist, inserting...");
            await db.insert(apiEndpoints).values(payload);
        }

        console.log("Successfully added/updated register endpoint!");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

run();
