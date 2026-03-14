import {
    MUTATION_ACTIONS,
    SYSTEM_PROTECTED_FIELDS,
    RELATION_TYPES,
    SYSTEM,
    ROLE_NAMES,
    SQL,
    DB_COLUMNS,
    CHARS,
} from '../config/constants';
import { LABELS } from '../config/labels';
import {
    escapeSQL,
    sanitizeIdentifier,
    safeJsonParse,
} from '../utils/common';
import { UserContext, DataSourceSchema } from '../types';
import { IMutationRepository } from '../types/repository';

const MSG = LABELS.ERROR;

interface MutationResult {
    success: boolean;
    data?: Record<string, unknown>;
    error?: string;
    recordId?: number;
}

export class MutationService {
    constructor(private repo: IMutationRepository) { }

    private sanitizeIdentifier(name: string): string {
        return sanitizeIdentifier(name);
    }

    async getSchema(dataSourceId: number): Promise<DataSourceSchema | null> {
        return this.repo.getSchema(dataSourceId);
    }

    async getTableName(dataSourceId: number): Promise<string | null> {
        return this.repo.getTableName(dataSourceId);
    }

    private findUserRelationColumn(schema: DataSourceSchema): string | null {
        const userFkColumn = schema.columns.find(
            col => col.relationType === RELATION_TYPES.BELONGS_TO && col.target === SYSTEM.USERS_TABLE
        );
        return userFkColumn?.name || null;
    }

    private processInputFields(
        body: Record<string, unknown>,
        schema: DataSourceSchema,
        userId: number,
        isUpdate: boolean = false
    ): Record<string, unknown> {
        const result: Record<string, unknown> = {};

        const schemaColumns = new Set(schema.columns.map(c => c.name));

        for (const [key, value] of Object.entries(body)) {
            if (SYSTEM_PROTECTED_FIELDS.includes(key as typeof SYSTEM_PROTECTED_FIELDS[number])) continue;
            if (!schemaColumns.has(key)) continue;
            result[key] = value;
        }

        const userFkColumn = this.findUserRelationColumn(schema);
        if (userFkColumn && !isUpdate) {
            result[userFkColumn] = userId;
        }

        if (isUpdate && userFkColumn) {
            delete result[userFkColumn];
        }

        return result;
    }

    private buildInsertQuery(tableName: string, data: Record<string, unknown>): { query: string; values: unknown[] } {
        const safeTable = this.sanitizeIdentifier(tableName);
        const columns: string[] = [];
        const placeholders: string[] = [];
        const values: unknown[] = [];

        for (const [key, value] of Object.entries(data)) {
            const safeColumn = this.sanitizeIdentifier(key);
            if (safeColumn) {
                columns.push(`\`${safeColumn}\``);
                placeholders.push(SQL.PLACEHOLDER);
                values.push(value);
            }
        }

        columns.push(`\`${DB_COLUMNS.CREATED_AT}\``);
        placeholders.push(SQL.NOW);

        const query = `${SQL.INSERT_INTO} \`${safeTable}\` (${columns.join(CHARS.COMMA + CHARS.SPACE)}) ${SQL.VALUES} (${placeholders.join(CHARS.COMMA + CHARS.SPACE)})`;
        return { query, values };
    }

    private buildUpdateQuery(tableName: string, recordId: number, data: Record<string, unknown>): { query: string; values: unknown[] } {
        const safeTable = this.sanitizeIdentifier(tableName);
        const setParts: string[] = [];
        const values: unknown[] = [];

        for (const [key, value] of Object.entries(data)) {
            const safeColumn = this.sanitizeIdentifier(key);
            if (safeColumn) {
                setParts.push(`\`${safeColumn}\` = ${SQL.PLACEHOLDER}`);
                values.push(value);
            }
        }

        setParts.push(`\`${DB_COLUMNS.UPDATED_AT}\` = ${SQL.NOW}`);
        values.push(recordId);

        const query = `${SQL.UPDATE} \`${safeTable}\` ${SQL.SET} ${setParts.join(CHARS.COMMA + CHARS.SPACE)} ${SQL.WHERE} \`${DB_COLUMNS.ID}\` = ${SQL.PLACEHOLDER}`;
        return { query, values };
    }

    async checkOwnership(tableName: string, recordId: number, user: UserContext, schema: DataSourceSchema): Promise<boolean> {
        if (user.role === ROLE_NAMES.ADMIN || user.role === ROLE_NAMES.SUPER_ADMIN) return true;

        const userFkColumn = this.findUserRelationColumn(schema);
        if (!userFkColumn) return false;

        const safeTable = this.sanitizeIdentifier(tableName);
        const safeColumn = this.sanitizeIdentifier(userFkColumn);
        const query = `${SQL.SELECT} \`${safeColumn}\` as ${DB_COLUMNS.OWNER_ID} ${SQL.FROM} \`${safeTable}\` ${SQL.WHERE} \`${DB_COLUMNS.ID}\` = ${SQL.PLACEHOLDER} ${SQL.LIMIT} 1`;

        return this.repo.checkOwnership(query, [recordId, user.id]);
    }

    async getRecord(tableName: string, recordId: number): Promise<Record<string, unknown> | null> {
        return this.repo.getRecord(tableName, recordId);
    }

    private async logMutation(
        endpointId: number,
        userId: number,
        action: string,
        tableName: string,
        recordId: number | null,
        beforeData: Record<string, unknown> | null,
        afterData: Record<string, unknown> | null,
        ip: string,
        userAgent: string
    ): Promise<void> {
        try {
            await this.repo.logMutation({
                endpointId,
                userId,
                action,
                tableName,
                recordId,
                beforeData: beforeData ? JSON.stringify(beforeData) : null,
                afterData: afterData ? JSON.stringify(afterData) : null,
                ip,
                userAgent,
            });
        } catch (err) {
            console.error(MSG.MUTATION_LOG_FAILED, err instanceof Error ? err.message : err);
        }
    }

    async create(
        dataSourceId: number,
        endpointId: number,
        body: Record<string, unknown>,
        user: UserContext,
        ip: string,
        userAgent: string
    ): Promise<MutationResult> {
        if (!user.authenticated) return { success: false, error: MSG.AUTHENTICATION_REQUIRED };

        const schema = await this.getSchema(dataSourceId);
        const tableName = await this.getTableName(dataSourceId);

        if (!schema || !tableName) return { success: false, error: MSG.SCHEMA_NOT_FOUND };

        const processedData = this.processInputFields(body, schema, user.id, false);
        if (Object.keys(processedData).length === 0) return { success: false, error: MSG.NO_WRITABLE_FIELDS };

        try {
            const { query, values } = this.buildInsertQuery(tableName, processedData);

            // Note: Repository handles parameter substitution or binding if we pass values
            // Currently keeping SQL construction here but passing raw query to repo might be unsafe/complex without strict binding support in repo interface.
            // Assuming repo.executeInsert takes parameterized query or handles logic.
            // For now, assuming executeInsert(query, values) does binding.

            const newId = await this.repo.executeInsert(query, values);

            const createdRecord = await this.getRecord(tableName, newId);

            await this.logMutation(endpointId, user.id, MUTATION_ACTIONS.CREATE, tableName, newId, null, createdRecord, ip, userAgent);

            return { success: true, data: createdRecord || { id: newId }, recordId: newId };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : MSG.RESOURCE_CREATE_FAILED;
            return { success: false, error: errorMessage };
        }
    }

    async update(
        dataSourceId: number,
        endpointId: number,
        recordId: number,
        body: Record<string, unknown>,
        user: UserContext,
        ip: string,
        userAgent: string
    ): Promise<MutationResult> {
        if (!user.authenticated) return { success: false, error: MSG.AUTHENTICATION_REQUIRED };

        const schema = await this.getSchema(dataSourceId);
        const tableName = await this.getTableName(dataSourceId);

        if (!schema || !tableName) return { success: false, error: MSG.SCHEMA_NOT_FOUND };

        const beforeRecord = await this.getRecord(tableName, recordId);
        if (!beforeRecord) return { success: false, error: MSG.NOT_FOUND };

        const canModify = await this.checkOwnership(tableName, recordId, user, schema);
        if (!canModify) return { success: false, error: MSG.OWNERSHIP_DENIED };

        const processedData = this.processInputFields(body, schema, user.id, true);
        if (Object.keys(processedData).length === 0) return { success: false, error: MSG.NO_WRITABLE_FIELDS };

        try {
            const { query, values } = this.buildUpdateQuery(tableName, recordId, processedData);

            await this.repo.executeUpdate(query, values);

            const afterRecord = await this.getRecord(tableName, recordId);

            await this.logMutation(endpointId, user.id, MUTATION_ACTIONS.UPDATE, tableName, recordId, beforeRecord, afterRecord, ip, userAgent);

            return { success: true, data: afterRecord || { id: recordId }, recordId };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : MSG.RESOURCE_UPDATE_FAILED;
            return { success: false, error: errorMessage };
        }
    }

    async delete(
        dataSourceId: number,
        endpointId: number,
        recordId: number,
        user: UserContext,
        ip: string,
        userAgent: string
    ): Promise<MutationResult> {
        if (!user.authenticated) return { success: false, error: MSG.AUTHENTICATION_REQUIRED };

        const schema = await this.getSchema(dataSourceId);
        const tableName = await this.getTableName(dataSourceId);

        if (!schema || !tableName) return { success: false, error: MSG.SCHEMA_NOT_FOUND };

        const beforeRecord = await this.getRecord(tableName, recordId);
        if (!beforeRecord) return { success: false, error: MSG.NOT_FOUND };

        const canModify = await this.checkOwnership(tableName, recordId, user, schema);
        if (!canModify) return { success: false, error: MSG.OWNERSHIP_DENIED };

        try {
            const safeTable = this.sanitizeIdentifier(tableName);
            const query = `${SQL.DELETE_FROM} \`${safeTable}\` ${SQL.WHERE} \`${DB_COLUMNS.ID}\` = ${recordId}`;
            await this.repo.executeMutation(query);

            await this.logMutation(endpointId, user.id, MUTATION_ACTIONS.DELETE, tableName, recordId, beforeRecord, null, ip, userAgent);

            return { success: true, data: { deleted: true, id: recordId }, recordId };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : MSG.RESOURCE_DELETE_FAILED;
            return { success: false, error: errorMessage };
        }
    }
}
