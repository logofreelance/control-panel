/**
 * delete-delete/logic.ts
 */
import * as model from './model';

import { targetStore } from '../target.store';

export function processDeleteTarget(db: any, id: string) {
    const success = targetStore.remove(db, id);
    if (!success) throw new Error('Target system not found');
}
