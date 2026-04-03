/**
 * feature-auth (HANYA MENGGUNAKAN INTERNAL DB)
 * ENTRY POINT UNTUK CONTROL PANEL ADMIN AUTH
 */
import { Hono } from 'hono';
import type { EnvironmentConfig } from '../../env';
import { buildInternalDatabaseConnection } from '../internal.db';
import { buildAuthPanelLucia } from './auth.lucia';
import { setupAuthPanelRoutes } from './auth.routes';

export function createFeaturePanelAuth(env: EnvironmentConfig) {
    const db = buildInternalDatabaseConnection(env.DATABASE_URL_INTERNAL_CONTROL_PANEL);
    const lucia = buildAuthPanelLucia(db);
    
    // Custom router type injection if needed
    const router = new Hono<{ Variables: { user: any, session: any } }>();
    
    setupAuthPanelRoutes(router, db, lucia);
    
    return router as any;
}
