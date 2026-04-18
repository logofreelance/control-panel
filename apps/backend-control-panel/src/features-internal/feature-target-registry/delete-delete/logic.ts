/**
 * delete-delete/logic.ts
 */
import * as model from './model';

export async function processDeleteTarget(db: any, id: string) {
    const exists = await model.checkTargetSystemExists(db, id);
    if (!exists) throw new Error('Target system not found');
    await model.removeTargetSystem(db, id);
}
