/**
 * create-post/logic.ts
 */
import * as model from './model';

export async function processCreateTarget(db: any, input: any) {
    if (!input.name?.trim()) throw new Error('Name is required');
    if (!input.databaseUrl?.trim()) throw new Error('Database URL is required');

    const id = crypto.randomUUID();
    await model.createTargetSystem(db, id, input.name.trim(), input.description?.trim() || '', input.databaseUrl.trim(), input.apiEndpoint?.trim() || null);
    
    const created = await model.findTargetSystemByIdFullSafe(db, id);
    if (!created) throw new Error('Failed to create target system');
    return created;
}
