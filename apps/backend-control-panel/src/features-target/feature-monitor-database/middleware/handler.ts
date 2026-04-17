/**
 * middleware/handler.ts
 *
 * Pola Mirror: Target Resolution → Guard → next()
 */

import { EnvironmentConfig } from '../../../env';

export function middleware(env: EnvironmentConfig) {
  return async (c: any, next: any) => {
    // Note: Target resolution is already mostly handled in main index.ts middleware 
    // for /api/monitor-database, but we align with the isolated pattern here.
    
    if (!c.get('targetDb')) {
        return c.json({ 
            status: 'error', 
            message: 'Target database connection not established. Make sure x-target-id header is provided.' 
        }, 400);
    }
    
    await next();
  };
}
