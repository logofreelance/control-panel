/**
 * cleanup-post/logic.ts
 */

import * as model from './model';

export async function runCleanup(db: any) {
    const details: string[] = [];
    let orphanedResources = 0;
    let invalidRelations = 0;

    // 1. Get physical tables
    const physicalTables = await model.getAllPhysicalTables(db);

    // 2. Cleanup orphaned database_tables metadata
    const schemas = await model.getManagedSchemas(db);
    for (const schema of schemas) {
        if (!physicalTables.includes(schema.table_name.toLowerCase())) {
            await model.deleteMetadataSchema(db, schema.id);
            details.push(`Removed orphaned schema metadata for table: ${schema.table_name}`);
            orphanedResources++;
        }
    }

    // 3. Cleanup orphaned database_relations metadata
    const relations = await model.getManagedRelations(db);
    for (const rel of relations) {
        const sourceExists = physicalTables.includes(rel.source_table.toLowerCase());
        const targetExists = physicalTables.includes(rel.target_table.toLowerCase());
        
        if (!sourceExists || !targetExists) {
            await model.deleteMetadataRelation(db, rel.id);
            details.push(`Removed invalid relation (ID: ${rel.id}) involving missing table: ${!sourceExists ? rel.source_table : rel.target_table}`);
            invalidRelations++;
        }
    }

    return {
        orphanedDataSources: 0,
        orphanedResources,
        invalidRelations,
        details
    };
}
