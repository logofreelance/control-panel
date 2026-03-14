import { StorageStats } from '../types';

export interface IStorageRepository {
    getStats(dbName: string): Promise<StorageStats>;
    dropTable(dbName: string, tableName: string): Promise<boolean>;
    cleanupOrphaned(dbName: string): Promise<{ orphanedDataSources: number; orphanedResources: number; invalidRelations: number; details: string[] }>;
}
