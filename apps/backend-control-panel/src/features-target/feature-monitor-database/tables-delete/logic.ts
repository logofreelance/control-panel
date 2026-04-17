/**
 * tables-delete/logic.ts
 */

import { PROTECTED_TABLES } from './config';
import * as model from './model';

export async function secureDropTable(db: any, tableName: string) {
    if (PROTECTED_TABLES.includes(tableName.toLowerCase())) {
        throw new Error(`Table '${tableName}' is a core system component and cannot be deleted.`);
    }

    return await model.dropTable(db, tableName);
}
