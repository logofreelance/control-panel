import { LABELS } from '../config/labels';
import { DataSource } from '../types';
import { IDataSourceRepository } from '../types/repository';
import { sanitizeTableName, validateSchema } from '../utils/validation';
import { buildCreateTableDDL, buildDropTableDDL } from '../utils/ddl-builder';
import { TABLE_PREFIXES, REGEX_PATTERNS, CHARS } from '../config/constants';

const MSG = LABELS;

export class DataSourceService {
    constructor(private repo: IDataSourceRepository) { }

    async list(isArchived: boolean = false) {
        return this.repo.list(isArchived);
    }

    async getStats() {
        return this.repo.getStats();
    }

    async getById(id: number) {
        const source = await this.repo.getById(id);
        if (!source) {
            throw new Error(MSG.ERROR.NOT_FOUND);
        }

        const schema = source.schemaJson ? JSON.parse(source.schemaJson as string) : { columns: [] };

        return {
            ...source,
            schema,
            isArchived: source.isArchived // Explicitly return
        };
    }

    async create(data: Partial<DataSource>) {
        if (!data.name) throw new Error(MSG.VALIDATION.TABLE_NAME_REQUIRED);

        const tableName = data.tableName || data.name.toLowerCase().replace(REGEX_PATTERNS.TABLE_NAME, CHARS.UNDERSCORE);
        const schema = data.schema || { columns: [] };

        const tableValidation = sanitizeTableName(tableName);
        if (!tableValidation.valid) {
            throw new Error(tableValidation.error || MSG.VALIDATION.INVALID_SCHEMA);
        }

        const schemaValidation = validateSchema(schema.columns);
        if (!schemaValidation.valid) {
            throw new Error(schemaValidation.errors.join(CHARS.COMMA + CHARS.SPACE));
        }

        const { ddl } = buildCreateTableDDL(tableValidation.sanitized, schema);
        await this.repo.executeDDL(ddl);

        const insertId = await this.repo.create({
            ...data,
            name: data.name,
            tableName: tableValidation.sanitized,
            schemaJson: JSON.stringify(schema),
            validationJson: data.validation ? JSON.stringify(data.validation) : undefined,
            isSystem: false,
            rowCount: 0,
            version: 1,
            isArchived: false,
            prefix: TABLE_PREFIXES.USER
        } as any); // Casting to any to avoid Partial<DataSource> strictness on optional fields being passed as required by repo

        return { id: insertId, message: MSG.SUCCESS.SOURCE_CREATED };
    }

    async update(id: number, data: Partial<DataSource>) {
        await this.getById(id);
        await this.repo.update(id, data);
        return { message: MSG.SUCCESS.SOURCE_UPDATED };
    }

    async archive(id: number) {
        await this.getById(id);
        await this.repo.archive(id);
        return { message: MSG.SUCCESS.SOURCE_ARCHIVED };
    }

    async restore(id: number) {
        await this.getById(id);
        await this.repo.restore(id);
        return { message: MSG.SUCCESS.SOURCE_RESTORED };
    }

    async destroy(id: number, force: boolean = false) {
        const source = await this.getById(id);

        // source already has isArchived from getById
        if (!source.isArchived && !force) {
            throw new Error(MSG.ERROR.ARCHIVE_FAILED);
        }

        const { ddl } = buildDropTableDDL(source.tableName);
        await this.repo.executeDDL(ddl);

        await this.repo.cleanupResources(id);
        await this.repo.destroy(id);

        return { message: MSG.SUCCESS.SOURCE_DELETED };
    }
}
