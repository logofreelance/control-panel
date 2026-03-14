import { DataSource } from '../types';

export interface IDataSourceRepository {
    list(isArchived?: boolean): Promise<DataSource[]>;
    getStats(): Promise<{ total_sources: number; total_tables: number; total_records: number }>;
    getById(id: number): Promise<DataSource | null>;
    create(data: Partial<DataSource> & { tableName: string }): Promise<number>;
    update(id: number, data: Partial<DataSource>): Promise<void>;
    archive(id: number): Promise<void>;
    restore(id: number): Promise<void>;
    destroy(id: number): Promise<void>;
    executeDDL(ddl: string): Promise<void>;
    cleanupResources(dataSourceId: number): Promise<void>;
}

export interface ISchemaRepository {
    getSource(id: number): Promise<{ source: DataSource; schema: any }>;
    updateSchema(id: number, schema: any, version: number): Promise<void>;
    executeDDL(ddl: string): Promise<void>;
}

export interface IDataRepository {
    findById(id: number): Promise<DataSource | null>;
    updateSource(id: number, data: Partial<DataSource>): Promise<void>;
    insertRow(tableName: string, columns: string[], values: any[]): Promise<number>;
    updateRow(tableName: string, rowId: number, updates: string[]): Promise<void>;
    deleteRow(tableName: string, rowId: number): Promise<void>;
    bulkInsert(tableName: string, columns: string[], values: any[][]): Promise<void>;
    bulkDelete(tableName: string, ids: any[]): Promise<void>;
}

export interface IRelationRepository {
    getSource(id: number): Promise<DataSource>;
    getTarget(id: number): Promise<DataSource>;
    getAllSources(): Promise<{ id: number; name: string; tableName: string; }[]>;
    getAvailableTargets(excludeId: number): Promise<{ id: number; name: string; tableName: string; }[]>;
    updateSchema(id: number, schema: any, version: number): Promise<void>;
    executeDDL(ddl: string): Promise<void>;
}

export interface IResourceRepository {
    list(dataSourceId: number): Promise<any[]>;
    create(data: any): Promise<number>;
    update(id: number, data: any): Promise<void>;
    delete(id: number): Promise<void>;
    findById(id: number): Promise<any>;
    getSource(id: number): Promise<DataSource>;
    getResource(id: number): Promise<any | null>;
    getDataSource(id: number): Promise<DataSource | null>;
}

export interface IResolverRepository {
    findEndpoint(path: string, method: string): Promise<any>;
    findErrorTemplate(statusCode: number, scope: string, scopeId?: number): Promise<string | null>;
    checkSuperAdmin(roleName: string): Promise<boolean>;
    getRolePermissions(roleName: string): Promise<string[]>;
    getDataSource(id: number): Promise<DataSource | null>;
    getResource(id: number): Promise<any | null>;
    executeDynamicQuery(query: string): Promise<any[]>;
}

export interface IMutationRepository {
    getSchema(dataSourceId: number): Promise<any | null>;
    getTableName(dataSourceId: number): Promise<string | null>;
    getRecord(tableName: string, recordId: number): Promise<any | null>;
    executeMutation(query: string): Promise<void>;
    executeInsert(query: string, values: any[]): Promise<number>;
    executeUpdate(query: string, values: any[]): Promise<void>;
    logMutation(data: any): Promise<void>;
    checkOwnership(query: string, values: any[]): Promise<boolean>;
}
