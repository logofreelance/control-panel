import { RELATION_TYPES, SYSTEM, COLUMN_TYPE_KEYS, DB_COLUMNS, CHARS } from '../config/constants';
import { LABELS } from '../config/labels';
import { DataSourceSchema, ColumnDefinition, DataSource } from '../types';
import { generateFKName, singularize } from '../utils/utils';
import { buildAddForeignKeyDDL, buildAddColumnDDL, buildCreatePivotTableDDL } from '../utils/ddl-builder';
import { IRelationRepository } from '../types/repository';

const MSG = LABELS;

export class RelationService {
    constructor(private repo: IRelationRepository) { }

    private async getSource(id: number) {
        try {
            return await this.repo.getSource(id);
        } catch {
            throw new Error(MSG.ERROR.NOT_FOUND);
        }
    }

    private async getTarget(id: number) {
        if (id === 0) {
            return {
                id: 0,
                name: SYSTEM.USERS_NAME,
                tableName: SYSTEM.USERS_TABLE,
                schemaJson: JSON.stringify({ columns: [] }),
                version: 1,
            } as unknown as DataSource;
        }
        try {
            return await this.repo.getTarget(id);
        } catch {
            throw new Error(MSG.ERROR.NOT_FOUND);
        }
    }

    private async updateSchema(id: number, schema: DataSourceSchema, version: number) {
        await this.repo.updateSchema(id, schema, version);
    }

    async list(id: number) {
        const source = await this.getSource(id);
        const schema: DataSourceSchema = source.schemaJson ? JSON.parse(source.schemaJson as string) : { columns: [] };

        const allSources = await this.repo.getAllSources();

        const lookup = new Map<string, { id: number, name: string, tableName: string }>();
        allSources.forEach((s: any) => lookup.set(s.tableName, s));
        lookup.set(SYSTEM.USERS_TABLE, { id: 0, name: SYSTEM.USERS_NAME, tableName: SYSTEM.USERS_TABLE });

        return schema.columns
            .filter((col: ColumnDefinition) => col.relationType || (col.target && ([COLUMN_TYPE_KEYS.INTEGER, COLUMN_TYPE_KEYS.BIGINT, COLUMN_TYPE_KEYS.UUID] as string[]).includes(col.type)))
            .map((col: ColumnDefinition) => {
                const targetSource = lookup.get(col.target as string);
                return {
                    id: Math.random(),
                    name: col.name,
                    type: col.relationType || RELATION_TYPES.BELONGS_TO,
                    alias: col.alias || col.name,
                    localKey: col.name,
                    foreignKey: DB_COLUMNS.ID,
                    target: {
                        id: targetSource?.id || -1,
                        name: targetSource?.name || col.target,
                        tableName: col.target
                    }
                };
            });
    }

    async add(id: number, type: string, targetId: number, alias?: string) {
        if (!(Object.values(RELATION_TYPES) as string[]).includes(type)) {
            throw new Error(MSG.ERROR.RELATION_FAILED);
        }

        if (id === targetId) throw new Error(MSG.ERROR.RELATION_FAILED);

        const source = await this.getSource(id);
        const target = await this.getTarget(targetId);

        const sourceSchema: DataSourceSchema = source.schemaJson ? JSON.parse(source.schemaJson as string) : { columns: [] };

        if (type === RELATION_TYPES.BELONGS_TO) {
            return this.addBelongsTo(source, target, sourceSchema, alias);
        } else if (type === RELATION_TYPES.HAS_ONE) {
            return this.addHasOne(source, target);
        } else if (type === RELATION_TYPES.HAS_MANY) {
            return this.addHasMany(source, target);
        } else if (type === RELATION_TYPES.MANY_TO_MANY) {
            return this.addManyToMany(source, target);
        }

        throw new Error(MSG.ERROR.RELATION_FAILED);
    }

    private async addBelongsTo(source: DataSource, target: DataSource, schema: DataSourceSchema, alias?: string) {
        const fkName = generateFKName(target.tableName);
        const colName = `${singularize(target.tableName)}${CHARS.UNDERSCORE}${DB_COLUMNS.ID}`;

        if (schema.columns.some((c: ColumnDefinition) => c.name === colName)) throw new Error(MSG.ERROR.ALREADY_EXISTS);

        const columnDef: ColumnDefinition = {
            name: colName,
            type: COLUMN_TYPE_KEYS.INTEGER,
            target: target.tableName,
            required: false,
            relationType: RELATION_TYPES.BELONGS_TO,
            alias: alias || singularize(target.tableName)
        };

        const { ddl: addColDDL } = buildAddColumnDDL(source.tableName, columnDef);
        await this.repo.executeDDL(addColDDL);

        try {
            const { ddl: fkDDL } = buildAddForeignKeyDDL(source.tableName, colName, target.tableName, fkName);
            await this.repo.executeDDL(fkDDL);
        } catch (e) {
            console.warn(MSG.ERROR.FK_CREATION_WARNING, e);
        }

        schema.columns.push(columnDef);
        await this.updateSchema(source.id, schema, (source.version || 1));

        return { message: MSG.SUCCESS.RELATION_ADDED };
    }

    private async addHasOne(source: DataSource, target: DataSource) {
        if (target.id === 0 || target.tableName === SYSTEM.USERS_TABLE) {
            throw new Error(MSG.ERROR.CANNOT_RELATE_TO_SYSTEM_USERS);
        }
        const targetSchema: DataSourceSchema = target.schemaJson ? JSON.parse(target.schemaJson as string) : { columns: [] };
        const fkColName = `${singularize(source.tableName)}${CHARS.UNDERSCORE}${DB_COLUMNS.ID}`;

        if (targetSchema.columns.some((c: ColumnDefinition) => c.name === fkColName)) return { message: MSG.SUCCESS.RELATION_ADDED };

        const columnDef: ColumnDefinition = {
            name: fkColName,
            type: COLUMN_TYPE_KEYS.INTEGER,
            target: source.tableName,
            unique: true
        };

        const { ddl: addColDDL } = buildAddColumnDDL(target.tableName, columnDef);
        await this.repo.executeDDL(addColDDL);

        try {
            const fkName = generateFKName(source.tableName);
            const { ddl: fkDDL } = buildAddForeignKeyDDL(target.tableName, fkColName, source.tableName, fkName);
            await this.repo.executeDDL(fkDDL);
        } catch (e) {
            console.warn(MSG.ERROR.FK_CREATION_WARNING, e);
        }

        targetSchema.columns.push(columnDef);
        await this.updateSchema(target.id, targetSchema, (target.version || 1));

        return { message: MSG.SUCCESS.RELATION_ADDED };
    }

    private async addHasMany(source: DataSource, target: DataSource) {
        if (target.id === 0 || target.tableName === SYSTEM.USERS_TABLE) {
            throw new Error(MSG.ERROR.CANNOT_RELATE_TO_SYSTEM_USERS);
        }
        const targetSchema: DataSourceSchema = target.schemaJson ? JSON.parse(target.schemaJson as string) : { columns: [] };
        const fkColName = `${singularize(source.tableName)}${CHARS.UNDERSCORE}${DB_COLUMNS.ID}`;

        if (targetSchema.columns.some((c: ColumnDefinition) => c.name === fkColName)) return { message: MSG.SUCCESS.RELATION_ADDED };

        const columnDef: ColumnDefinition = {
            name: fkColName,
            type: COLUMN_TYPE_KEYS.INTEGER,
            target: source.tableName
        };

        const { ddl: addColDDL } = buildAddColumnDDL(target.tableName, columnDef);
        await this.repo.executeDDL(addColDDL);

        try {
            const fkName = generateFKName(source.tableName);
            const { ddl: fkDDL } = buildAddForeignKeyDDL(target.tableName, fkColName, source.tableName, fkName);
            await this.repo.executeDDL(fkDDL);
        } catch (e) {
            console.warn(MSG.ERROR.FK_CREATION_WARNING, e);
        }

        targetSchema.columns.push(columnDef);
        await this.updateSchema(target.id, targetSchema, (target.version || 1));

        return { message: MSG.SUCCESS.RELATION_ADDED };
    }

    private async addManyToMany(source: DataSource, target: DataSource) {
        const { ddl } = buildCreatePivotTableDDL(source.tableName, target.tableName);
        await this.repo.executeDDL(ddl);
        return { message: MSG.SUCCESS.RELATION_ADDED };
    }

    async getAvailableTargets(excludeId: number) {
        const others = await this.repo.getAvailableTargets(excludeId);
        const users = { id: 0, name: SYSTEM.USERS_NAME, tableName: SYSTEM.USERS_TABLE };
        return [users, ...others];
    }

    async update(sourceId: number, relationName: string, updates: { alias?: string, type?: string }) {
        const source = await this.getSource(sourceId);
        const schema: DataSourceSchema = source.schemaJson ? JSON.parse(source.schemaJson as string) : { columns: [] };

        const colIndex = schema.columns.findIndex((c: ColumnDefinition) => c.name === relationName);
        if (colIndex === -1) throw new Error(MSG.ERROR.NOT_FOUND);

        const col = schema.columns[colIndex];
        if (!col.target) throw new Error(MSG.ERROR.NOT_A_RELATION);

        if (updates.alias !== undefined) col.alias = updates.alias;
        if (updates.type !== undefined) col.relationType = updates.type;

        schema.columns[colIndex] = col;
        await this.updateSchema(source.id, schema, (source.version || 1));

        return { message: MSG.SUCCESS.RELATION_UPDATED };
    }

    async delete(id: number, relationName: string) {
        const source = await this.getSource(id);
        const schema: DataSourceSchema = source.schemaJson ? JSON.parse(source.schemaJson as string) : { columns: [] };

        const colIndex = schema.columns.findIndex((c: ColumnDefinition) => c.name === relationName);
        if (colIndex === -1) return { message: MSG.SUCCESS.RELATION_DELETED };

        const col = schema.columns[colIndex];

        delete col.relationType;
        delete col.alias;

        schema.columns[colIndex] = col;
        await this.updateSchema(source.id, schema, (source.version || 1));

        return { message: MSG.SUCCESS.RELATION_DELETED };
    }
}
