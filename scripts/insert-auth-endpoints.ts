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

        // LOGIN
        await upsertEndpoint('/auth/login', {
            path: '/auth/login',
            method: 'POST',
            description: 'Authenticate a user and receive an active session token.',
            categoryId: catId, isActive: true, minRoleLevel: 0, operationType: 'read',
            writableFields: JSON.stringify({
                "Content-Type": "application/json",
                body: JSON.stringify({
                    identifier: "string (email or username)",
                    password: "string (required)"
                }, null, 2)
            }),
            responseData: JSON.stringify({
                success: JSON.stringify({
                    token: "string (session token)",
                    user: { id: "number", username: "string", email: "string", role: "string" }
                }, null, 2),
                errors: ["Invalid credentials", "Account disabled", "Rate limited"]
            })
        });

        // FORGOT PASSWORD
        await upsertEndpoint('/auth/forgot-password', {
            path: '/auth/forgot-password',
            method: 'POST',
            description: 'Request a password reset link to be sent to the user email.',
            categoryId: catId, isActive: true, minRoleLevel: 0, operationType: 'create',
            writableFields: JSON.stringify({
                "Content-Type": "application/json",
                body: JSON.stringify({ email: "string (required, valid email)" }, null, 2)
            }),
            responseData: JSON.stringify({
                success: JSON.stringify({ message: "string (If the email is registered, a reset link will be sent)" }, null, 2),
                errors: ["Invalid email format", "Rate limited"]
            })
        });

        // LOGOUT
        await upsertEndpoint('/auth/logout', {
            path: '/auth/logout',
            method: 'POST',
            description: 'Invalidate the current session token.',
            categoryId: catId, isActive: true, minRoleLevel: 10, operationType: 'delete',
            writableFields: JSON.stringify({
                "Authorization": "Bearer <token>"
            }),
            responseData: JSON.stringify({
                success: JSON.stringify({ success: "boolean (true)" }, null, 2),
                errors: ["Unauthorized"]
            })
        });

        console.log("Successfully added login, forgot-password, and logout endpoints!");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();
