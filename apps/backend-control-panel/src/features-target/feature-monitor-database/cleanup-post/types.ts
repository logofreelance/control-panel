/**
 * cleanup-post/types.ts
 */

export interface CleanupResult {
    orphanedDataSources: number;
    orphanedResources: number;
    invalidRelations: number;
    details: string[];
}
