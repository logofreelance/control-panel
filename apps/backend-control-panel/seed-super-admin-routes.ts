/**
 * Seed Super Admin User Management Routes
 *
 * Run with: npx tsx apps/backend-control-panel/seed-super-admin-routes.ts
 *
 * This script adds the Super Admin user management endpoints to the api_endpoints table.
 */

import * as path from "path";
import * as dotenv from "dotenv";

// Load .env from backend-system
dotenv.config({
  path: path.resolve(__dirname, "../../backend-system/apps/engine/.env"),
});

import {
  createDb,
  apiEndpoints,
  apiCategories,
  eq,
  and,
} from "@modular/database";

// Get DATABASE_URL from environment
const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error("DATABASE_URL not found in environment");
  process.exit(1);
}

async function seed() {
  console.log("🔄 Connecting to database...");

  const db = createDb(dbUrl!);

  // First, get or create the "Super Admin" category
  console.log("📁 Checking for Super Admin category...");

  const [existingCategory] = await db
    .select()
    .from(apiCategories)
    .where(eq(apiCategories.name, "Super Admin - User Management"))
    .limit(1);

  let categoryId: number;

  if (!existingCategory) {
    console.log("➕ Creating Super Admin category...");

    // Insert and then fetch the inserted category
    await db.insert(apiCategories).values({
      name: "Super Admin - User Management",
      description: "Super Admin user management endpoints",
    });

    const [newCategory] = await db
      .select()
      .from(apiCategories)
      .where(eq(apiCategories.name, "Super Admin - User Management"))
      .limit(1);

    categoryId = newCategory.id;
  } else {
    console.log("✅ Category already exists");
    categoryId = existingCategory.id;
  }

  // Define the routes to seed
  const routes = [
    {
      method: "GET",
      path: "/api/auth/admin/users",
      description: "List all users (Super Admin only)",
      categoryId,
      isActive: true,
      minRoleLevel: 100,
      roles: "super_admin",
    },
    {
      method: "GET",
      path: "/api/auth/admin/users/:id",
      description: "Get user by ID (Super Admin only)",
      categoryId,
      isActive: true,
      minRoleLevel: 100,
      roles: "super_admin",
    },
    {
      method: "POST",
      path: "/api/auth/admin/users",
      description: "Create new user (Super Admin only)",
      categoryId,
      isActive: true,
      minRoleLevel: 100,
      roles: "super_admin",
      operationType: "create",
      writableFields: JSON.stringify(["username", "email", "password", "role"]),
    },
    {
      method: "PUT",
      path: "/api/auth/admin/users/:id",
      description: "Update user (Super Admin only)",
      categoryId,
      isActive: true,
      minRoleLevel: 100,
      roles: "super_admin",
      operationType: "update",
      writableFields: JSON.stringify([
        "username",
        "email",
        "password",
        "role",
        "is_active",
      ]),
    },
    {
      method: "DELETE",
      path: "/api/auth/admin/users/:id",
      description: "Delete user (Super Admin only)",
      categoryId,
      isActive: true,
      minRoleLevel: 100,
      roles: "super_admin",
      operationType: "delete",
    },
  ];

  // Check and insert each route
  for (const route of routes) {
    const [existing] = await db
      .select()
      .from(apiEndpoints)
      .where(
        and(
          eq(apiEndpoints.path, route.path),
          eq(apiEndpoints.method, route.method),
        ),
      )
      .limit(1);

    if (!existing) {
      console.log(`➕ Adding: ${route.method} ${route.path}`);
      await db.insert(apiEndpoints).values(route);
    } else {
      console.log(`🔄 Updating: ${route.method} ${route.path}`);
      await db
        .update(apiEndpoints)
        .set(route)
        .where(eq(apiEndpoints.id, existing.id));
    }
  }

  console.log("🎉 Super Admin routes seeded successfully!");
}

seed().catch(console.error);
