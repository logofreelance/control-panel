
import { COLUMN_TYPES } from '../config/types';
import { formatDDL } from '../utils/format';
import { SQL, SQL_TYPES, SYSTEM, DB_COLUMNS, COLUMN_TYPE_KEYS, CHARS, SQL_PLACEHOLDERS, SYSTEM_DEFAULTS } from '../config/constants';
import { DataSourceSchema, ColumnDefinition } from '../types';
import { singularize } from './utils';

// Helper to map type to SQL using COLUMN_TYPES from config
function mapTypeToSQL(col: ColumnDefinition): string {
    const typeDef = COLUMN_TYPES[col.type as keyof typeof COLUMN_TYPES];

    if (!typeDef) {
        return formatDDL(COLUMN_TYPES.string.sql, { length: String(col.length || SYSTEM_DEFAULTS.LENGTH) });
    }

    let sqlType = typeDef.sql;

    if (sqlType.includes(SQL_PLACEHOLDERS.LENGTH)) {
        const length = col.length || typeDef.defaults?.length || SYSTEM_DEFAULTS.LENGTH;
        sqlType = formatDDL(sqlType, { length: String(length) });
    }

    if (sqlType.includes(SQL_PLACEHOLDERS.PRECISION) || sqlType.includes(SQL_PLACEHOLDERS.SCALE)) {
        const precision = col.precision || typeDef.defaults?.precision || SYSTEM_DEFAULTS.PRECISION;
        const scale = col.scale || typeDef.defaults?.scale || SYSTEM_DEFAULTS.SCALE;
        sqlType = formatDDL(sqlType, {
            precision: String(precision),
            scale: String(scale)
        });
    }

    if (sqlType.includes(SQL_PLACEHOLDERS.VALUES) && col.values) {
        const options = col.values.map(v => CHARS.SINGLE_QUOTE + v + CHARS.SINGLE_QUOTE).join(CHARS.COMMA);
        sqlType = formatDDL(sqlType, { values: options });
    }

    return sqlType;
}

// Generate column definition SQL
function buildColumnSQL(col: ColumnDefinition): string {
    let sql = `\`${col.name}\` ${mapTypeToSQL(col)}`;

    if (col.required) {
        sql += ` ${SQL.NOT_NULL}`;
    } else {
        sql += ` ${SQL.NULL}`;
    }

    if (col.unique) {
        sql += ` ${SQL.UNIQUE}`;
    }

    if (col.default !== undefined) {
        if (col.type === COLUMN_TYPE_KEYS.BOOLEAN) {
            const val = String(col.default).toLowerCase();
            const boolVal = (val === 'true' || val === SQL.TRUE_VAL) ? SQL_TYPES.TRUE : SQL_TYPES.FALSE;
            sql += ` ${SQL.DEFAULT} ${boolVal}`;
        } else if (typeof col.default === 'string') {
            sql += ` ${SQL.DEFAULT} '${col.default}'`;
        } else {
            sql += ` ${SQL.DEFAULT} ${col.default}`;
        }
    }

    if (col.comment) {
        sql += ` ${SQL.COMMENT} '${col.comment.replace(/'/g, CHARS.SINGLE_QUOTE + CHARS.SINGLE_QUOTE)}'`;
    }

    return sql;
}

export function buildCreateTableDDL(tableName: string, schema: DataSourceSchema) {
    const columns = [...schema.columns];
    const columnDefs = columns.map(c => buildColumnSQL(c));
    const standardCols = [];
    standardCols.push(`\`${DB_COLUMNS.ID}\` ${SQL_TYPES.INT} ${SQL.AUTO_INCREMENT} ${SQL.PRIMARY_KEY}`);

    if (schema.timestamps) {
        standardCols.push(`\`${DB_COLUMNS.CREATED_AT}\` ${SQL_TYPES.DATETIME} ${SQL.DEFAULT} ${SQL.CURRENT_TIMESTAMP}`);
        standardCols.push(`\`${DB_COLUMNS.UPDATED_AT}\` ${SQL_TYPES.DATETIME} ${SQL.DEFAULT} ${SQL.CURRENT_TIMESTAMP} ${SQL.ON_UPDATE} ${SQL.CURRENT_TIMESTAMP}`);
    }

    if (schema.softDelete) {
        standardCols.push(`\`${DB_COLUMNS.DELETED_AT}\` ${SQL_TYPES.TIMESTAMP} ${SQL.NULL}`);
    }

    const allDefs = [...standardCols, ...columnDefs];

    const ddl = `${SQL.CREATE_TABLE} ${SQL.IF_NOT_EXISTS} \`${tableName}\` (
        ${allDefs.join(CHARS.COMMA + '\n        ')}
    ) ENGINE=${SYSTEM.DEFAULT_ENGINE} DEFAULT CHARSET=${SYSTEM.DEFAULT_CHARSET} COLLATE=${SYSTEM.DEFAULT_COLLATE}`;

    return { ddl };
}

export function buildDropTableDDL(tableName: string) {
    return { ddl: `${SQL.DROP_TABLE} ${SQL.IF_EXISTS} \`${tableName}\`` };
}

export function buildAddColumnDDL(tableName: string, column: ColumnDefinition) {
    return { ddl: `${SQL.ALTER_TABLE} \`${tableName}\` ${SQL.ADD_COLUMN} ${buildColumnSQL(column)}` };
}

export function buildModifyColumnDDL(tableName: string, column: ColumnDefinition) {
    return { ddl: `${SQL.ALTER_TABLE} \`${tableName}\` ${SQL.MODIFY_COLUMN} ${buildColumnSQL(column)}` };
}

export function buildDropColumnDDL(tableName: string, columnName: string) {
    return { ddl: `${SQL.ALTER_TABLE} \`${tableName}\` ${SQL.DROP_COLUMN} \`${columnName}\`` };
}

export function buildAddForeignKeyDDL(tableName: string, column: string, targetTable: string, fkName: string) {
    const ddl = `${SQL.ALTER_TABLE} \`${tableName}\` ADD CONSTRAINT \`${fkName}\` ${SQL.FOREIGN_KEY} (\`${column}\`) ${SQL.REFERENCES} \`${targetTable}\` (\`${DB_COLUMNS.ID}\`)`;
    return { ddl };
}

export function buildCreatePivotTableDDL(table1: string, table2: string) {
    const tables = [table1, table2].sort();
    const pivotName = `${tables[0]}${CHARS.UNDERSCORE}${tables[1]}`;
    const key1 = `${singularize(tables[0])}${CHARS.UNDERSCORE}${DB_COLUMNS.ID}`;
    const key2 = `${singularize(tables[1])}${CHARS.UNDERSCORE}${DB_COLUMNS.ID}`;

    const ddl = `${SQL.CREATE_TABLE} ${SQL.IF_NOT_EXISTS} \`${pivotName}\` (
        \`${DB_COLUMNS.ID}\` ${SQL_TYPES.INT} ${SQL.AUTO_INCREMENT} ${SQL.PRIMARY_KEY},
        \`${key1}\` ${SQL_TYPES.INT} ${SQL.NOT_NULL},
        \`${key2}\` ${SQL_TYPES.INT} ${SQL.NOT_NULL},
        \`${DB_COLUMNS.CREATED_AT}\` ${SQL_TYPES.DATETIME} ${SQL.DEFAULT} ${SQL.CURRENT_TIMESTAMP},
        ${SQL.UNIQUE} KEY \`${DB_COLUMNS.UNIQUE_PAIR}\` (\`${key1}\`, \`${key2}\`)
    ) ENGINE=${SYSTEM.DEFAULT_ENGINE} DEFAULT CHARSET=${SYSTEM.DEFAULT_CHARSET} COLLATE=${SYSTEM.DEFAULT_COLLATE}`;

    return { ddl, pivotName };
}
