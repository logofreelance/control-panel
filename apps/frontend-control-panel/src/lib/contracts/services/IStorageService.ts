
export interface IStorageService {
    getStats(dbName: string): Promise<any>;
    dropTable(dbName: string, tableName: string): Promise<boolean>;
    cleanupOrphaned(dbName: string): Promise<any>;
}
