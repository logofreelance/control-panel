import { MonitorAggregates, DbValidationResult, LogData, ErrorTemplateData, AdminData } from './index';



export interface DbSetupResult {
    message: string;
    status: string;
    provider: { name: string; icon: string };
    tablesCreated: number;
}

export interface MigrationResult {
    status: string;
    message: string;
    results: string[];
}

export interface IMonitorRepository {
    getAggregateStats(): Promise<MonitorAggregates>;
    getRecentLogs(limit: number): Promise<LogData[]>;
}

export interface IErrorTemplateRepository {
    listTemplates(): Promise<ErrorTemplateData[]>;
    getGlobalTemplates(): Promise<ErrorTemplateData[]>;
    findTemplate(statusCode: number, routeId?: number, categoryId?: number): Promise<ErrorTemplateData | null>;
    /**
     * Finds an exact match for updating or inserting
     */
    findExactTemplate(scope: string, scopeId: number | null, statusCode: number): Promise<ErrorTemplateData | null>;
    saveTemplate(data: Omit<ErrorTemplateData, 'id'>): Promise<void>;
    updateTemplate(id: number, template: string): Promise<void>;
    deleteTemplate(id: number): Promise<void>;
}

export interface ISystemRepository {
    /**
     * Validation checks
     */
    checkConnection(dbUrl: string): Promise<boolean>;
    getTablesCount(dbUrl: string): Promise<number>;
    hasAdmin(dbUrl: string): Promise<boolean>;
    hasAdminTable(dbUrl: string): Promise<boolean>;

    /**
     * Actions
     */
    createAdmin(dbUrl: string, data: AdminData): Promise<void>;

    /**
     * Schema & Setup
     */
    createSystemTables(dbUrl: string): Promise<number>;
    executeSql(dbUrl: string, sqlString: string): Promise<void>;
    seedRoles(dbUrl: string): Promise<void>;
    seedErrorTemplates(dbUrl: string): Promise<void>;
    seedSettings(dbUrl: string, settings: { siteName: string; siteTitle: string; primaryColor: string }): Promise<void>;

    /**
     * Migrations helpers
     */
    addMinRoleLevelColumn(dbUrl: string): Promise<void>;
    addDescriptionColumn(dbUrl: string): Promise<void>;
}
