import { CHARS, SECURITY_LIMITS } from '../config/constants';
import { LABELS } from '../config/labels';
import { validateBulkIds, isSafeInteger, safeJsonParse } from '../utils/common';
import { DataSourceSchema } from '../types';
import { validateRow } from '../utils/validation';
import { IDataRepository } from '../types/repository';

const MSG = LABELS;

export class DataService {
    constructor(private repo: IDataRepository) { }

    private async getSource(id: number) {
        if (!isSafeInteger(id) || id <= 0) {
            throw new Error(MSG.ERROR.INVALID_IDS);
        }

        const result = await this.repo.findById(id);
        if (!result) throw new Error(MSG.ERROR.NOT_FOUND);

        const schema = result.schemaJson ? safeJsonParse(result.schemaJson, { columns: [] }) as DataSourceSchema : { columns: [] };

        return { source: result, schema };
    }

    async insertRow(id: number, data: Record<string, unknown>) {
        const { source, schema } = await this.getSource(id);

        const validationRules = safeJsonParse(source.validationJson as string, {});
        const validation = validateRow(data, schema.columns, validationRules);
        if (!validation.valid) {
            throw new Error(MSG.VALIDATION.INVALID_SCHEMA + CHARS.COLON + CHARS.SPACE + JSON.stringify(validation.errors));
        }

        const validColumns = schema.columns.map(c => c.name);
        const keys = Object.keys(data).filter(k => validColumns.includes(k));

        if (keys.length === 0) throw new Error(MSG.ERROR.NO_VALID_COLUMNS);

        const values = keys.map(k => data[k]);

        const insertId = await this.repo.insertRow(source.tableName, keys, values);

        await this.repo.updateSource(id, {
            rowCount: (source.rowCount || 0) + 1,
            updatedAt: new Date()
        });

        return { message: MSG.SUCCESS.ROW_INSERTED, id: insertId };
    }

    async updateRow(id: number, rowId: number, data: Record<string, unknown>) {
        if (!isSafeInteger(rowId) || rowId <= 0) throw new Error(MSG.VALIDATION.INVALID_ROW_ID);

        const { source, schema } = await this.getSource(id);

        const validColumns = schema.columns.map(c => c.name);
        const keys = Object.keys(data).filter(k => validColumns.includes(k));

        if (keys.length === 0) throw new Error(MSG.ERROR.NO_VALID_COLUMNS);

        const updates = keys.map(k => {
            const val = data[k];
            const safeVal = typeof val === 'string' ? `'${val.replace(/'/g, "''")}'` : val;
            return `\`${k}\` = ${safeVal}`;
        });

        await this.repo.updateRow(source.tableName, rowId, updates);

        return { message: MSG.SUCCESS.ROW_UPDATED };
    }

    async deleteRow(id: number, rowId: number) {
        if (!isSafeInteger(rowId) || rowId <= 0) throw new Error(MSG.VALIDATION.INVALID_ROW_ID);

        const { source } = await this.getSource(id);

        await this.repo.deleteRow(source.tableName, rowId);

        await this.repo.updateSource(id, {
            rowCount: Math.max(0, (source.rowCount || 1) - 1),
            updatedAt: new Date()
        });

        return { message: MSG.SUCCESS.ROW_DELETED };
    }

    async bulkInsert(id: number, rows: Record<string, unknown>[]) {
        if (!Array.isArray(rows) || rows.length === 0) throw new Error(MSG.ERROR.ARRAY_OF_ROWS_REQUIRED);

        if (rows.length > SECURITY_LIMITS.MAX_BULK_ITEMS) {
            throw new Error(MSG.VALIDATION.MAX_BULK_ITEMS);
        }

        const { source, schema } = await this.getSource(id);
        const validColumns = schema.columns.map(c => c.name);

        const keys = Object.keys(rows[0]).filter(k => validColumns.includes(k));
        if (keys.length === 0) throw new Error(MSG.ERROR.NO_VALID_COLUMNS);

        const valuesList = rows.map(row => {
            return keys.map(k => row[k]);
        });

        await this.repo.bulkInsert(source.tableName, keys, valuesList);

        await this.repo.updateSource(id, {
            rowCount: (source.rowCount || 0) + rows.length,
            updatedAt: new Date()
        });

        return { message: MSG.SUCCESS.DATA_IMPORTED };
    }

    async bulkDelete(id: number, rowIds: unknown) {
        const safeIds = validateBulkIds(rowIds);

        const { source } = await this.getSource(id);

        await this.repo.bulkDelete(source.tableName, safeIds);

        await this.repo.updateSource(id, {
            rowCount: Math.max(0, (source.rowCount || safeIds.length) - safeIds.length),
            updatedAt: new Date()
        });

        return { message: MSG.SUCCESS.ROWS_DELETED };
    }
}
