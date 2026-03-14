import { LABELS } from '../config/labels';
import { ColumnDefinition } from '../types';
import { ISchemaRepository } from '../types/repository';
import { buildAddColumnDDL, buildDropColumnDDL, buildModifyColumnDDL } from '../utils/ddl-builder';
import { DB_COLUMNS } from '../config/constants';

const MSG = LABELS;

export class SchemaService {
    constructor(private repo: ISchemaRepository) { }

    async addColumn(id: number, column: ColumnDefinition) {
        const { source, schema } = await this.repo.getSource(id);

        const { ddl } = buildAddColumnDDL(source.tableName, column);
        await this.repo.executeDDL(ddl);

        schema.columns.push(column);

        await this.repo.updateSchema(id, schema, (source.version || 1) + 1);

        return { message: MSG.SUCCESS.COLUMN_ADDED };
    }

    async modifyColumn(id: number, oldName: string, column: ColumnDefinition) {
        if (oldName !== column.name) {
            throw new Error(MSG.ERROR.CANNOT_RENAME_COLUMN);
        }

        const { source, schema } = await this.repo.getSource(id);

        const { ddl } = buildModifyColumnDDL(source.tableName, column);
        await this.repo.executeDDL(ddl);

        const idx = schema.columns.findIndex((col: ColumnDefinition) => col.name === oldName);
        if (idx !== -1) {
            schema.columns[idx] = column;
        } else {
            throw new Error(MSG.ERROR.COLUMN_NOT_FOUND);
        }

        await this.repo.updateSchema(id, schema, (source.version || 1) + 1);

        return { message: MSG.SUCCESS.SCHEMA_UPDATED };
    }

    async dropColumn(id: number, columnName: string) {
        if (columnName === DB_COLUMNS.ID) {
            throw new Error(MSG.ERROR.CANNOT_DROP_ID);
        }

        const { source, schema } = await this.repo.getSource(id);

        const { ddl } = buildDropColumnDDL(source.tableName, columnName);
        await this.repo.executeDDL(ddl);

        schema.columns = schema.columns.filter((col: ColumnDefinition) => col.name !== columnName);

        await this.repo.updateSchema(id, schema, (source.version || 1) + 1);

        return { message: MSG.SUCCESS.COLUMN_DROPPED };
    }

    async getColumns(id: number) {
        const { schema } = await this.repo.getSource(id);

        return schema.columns.map((col: ColumnDefinition) => ({
            name: col.name,
            type: col.type,
            nullable: !col.required,
            isPrimary: col.name === DB_COLUMNS.ID,
            hasDefault: col.default !== undefined,
            defaultValue: col.default !== undefined ? String(col.default) : undefined,
            relationTarget: col.target !== undefined ? String(col.target) : undefined
        }));
    }
}
