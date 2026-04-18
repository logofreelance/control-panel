/**
 * update-put/logic.ts
 */
import * as model from './model';

export async function processUpdateTarget(db: any, id: string, input: any) {
    const existing = await model.findTargetSystemByIdFullSafe(db, id);
    if (!existing) throw new Error('Target system not found');

    const fields: Record<string, string> = {};
    if (input.name !== undefined) fields['name'] = input.name.trim();
    if (input.description !== undefined) fields['description'] = input.description.trim();
    if (input.apiEndpoint !== undefined) fields['api_endpoint'] = input.apiEndpoint.trim();
    if (input.databaseUrl !== undefined) fields['database_url'] = input.databaseUrl.trim();

    await model.updateTargetSystem(db, id, fields);
    
    const updated = await model.findTargetSystemByIdFullSafe(db, id);
    if (!updated) throw new Error('Failed to update target system');
    return updated;
}
