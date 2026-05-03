/**
 * create-post/logic.ts
 */
import * as model from './model';

import { targetStore } from '../target.store';

export function processCreateTarget(db: any, input: any) {
    if (!input.name?.trim()) throw new Error('Name is required');
    if (!input.databaseUrl?.trim()) throw new Error('Database URL is required');

    const id = crypto.randomUUID();
    const newTarget = {
        id,
        name: input.name.trim(),
        description: input.description?.trim() || '',
        database_url: input.databaseUrl.trim(),
        api_endpoint: input.apiEndpoint?.trim() || null,
        status: 'unknown',
        last_health_check: null,
        created_at: new Date().toISOString()
    };

    targetStore.add(db, newTarget);
    return newTarget;
}
