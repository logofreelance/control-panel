/**
 * update-put/logic.ts
 */
import * as model from './model';

import { targetStore } from '../target.store';

export function processUpdateTarget(db: any, id: string, input: any) {
    const fields: Record<string, any> = {};
    if (input.name !== undefined) fields['name'] = input.name.trim();
    if (input.description !== undefined) fields['description'] = input.description.trim();
    if (input.apiEndpoint !== undefined) fields['api_endpoint'] = input.apiEndpoint.trim();
    if (input.databaseUrl !== undefined) fields['database_url'] = input.databaseUrl.trim();

    const success = targetStore.update(db, id, fields);
    if (!success) throw new Error('Target system not found');
    
    return targetStore.getById(id);
}
