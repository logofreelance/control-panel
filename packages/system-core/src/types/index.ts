
export interface MonitorAggregates {
    total: number;
    success: number;
    avg_latency: number;
}

export interface LogData {
    id: number;
    endpoint: string | null;
    method: string | null;
    statusCode: number | null;
    durationMs: number | null;
    ip: string | null;
    createdAt: Date | null;
}

export interface ErrorTemplateData {
    id: number;
    scope: string;
    scopeId: number | null;
    statusCode: number;
    template: string;
}

export interface AdminData {
    username: string;
    passwordHash: string;
}

export interface ParsedDbUrl {
    user: string;
    password: string;
    host: string;
    port: number;
    database: string;
    params: string;
}

export interface ProviderInfo {
    name: string;
    requiredParams: string[];
    icon: string;
}

export interface DbValidationResult {
    valid: boolean;
    status: 'success' | 'error';
    provider?: { name: string; icon: string };
    parsed?: {
        host: string;
        port: number;
        database: string;
        user: string;
    };
    hints?: string[];
    message?: string;
}

export interface SystemStatus {
    hasDbUrl: boolean;
    isDbConnected: boolean;
    isInitialized: boolean;
    isAdminCreated: boolean;
    provider: { name: string; icon: string } | null;
    tablesCount: number;
    debug?: Record<string, unknown>;
}

export interface IMonitorService {
    getStats(): Promise<{ aggregates: MonitorAggregates; recentLogs: LogData[] }>;
}

export interface IErrorTemplateService {
    listTemplates(): Promise<ErrorTemplateData[]>;
    getGlobalTemplates(): Promise<ErrorTemplateData[]>;
    resolveTemplate(statusCode: number, routeId?: string, categoryId?: string): Promise<{ template: string; scope?: string }>;
    saveTemplate(scope: string, scopeId: number | null, statusCode: number, template: string): Promise<{ message: string }>;
    deleteTemplate(id: number): Promise<{ message: string }>;
}
