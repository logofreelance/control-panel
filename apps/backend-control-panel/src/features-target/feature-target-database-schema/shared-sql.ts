/**
 * SQL Type Mapping for Database Schema
 */
export const SQL_TYPE_MAP: Record<string, string> = {
  // Identifiers
  id: 'INT(11) UNSIGNED',
  uuid: 'CHAR(36)',
  // Numeric
  tinyint: 'TINYINT',
  smallint: 'SMALLINT',
  mediumint: 'MEDIUMINT',
  integer: 'INT',
  int: 'INT',
  bigint: 'BIGINT',
  decimal: 'DECIMAL(10,2)',
  float: 'FLOAT',
  double: 'DOUBLE',
  bit: 'BIT(1)',
  // Text
  char: 'CHAR(1)',
  string: 'VARCHAR(255)',
  varchar: 'VARCHAR(255)',
  tinytext: 'TINYTEXT',
  text: 'TEXT',
  mediumtext: 'MEDIUMTEXT',
  longtext: 'LONGTEXT',
  slug: 'VARCHAR(255)',
  email: 'VARCHAR(255)',
  phone: 'VARCHAR(50)',
  url: 'VARCHAR(2048)',
  // Date/Time
  datetime: 'DATETIME',
  date: 'DATE',
  time: 'TIME',
  timestamp: 'TIMESTAMP',
  year: 'YEAR',
  // Structured
  json: 'JSON',
  enum: 'VARCHAR(100)',
  set: 'SET',
  // Boolean & Status
  boolean: 'TINYINT(1)',
  status: 'VARCHAR(50)',
  // Media
  image: 'VARCHAR(2048)',
  file: 'VARCHAR(2048)',
  // Relational
  relation: 'INT(11) UNSIGNED',
};

/**
 * Maps a logical type to a physical SQL type.
 */
export function mapTypeToSql(type: string, options?: any): string {
  // Special case for ENUM / SET
  if ((type === 'enum' || type === 'set') && (options?.values || options?.allowedValues)) {
    const rawValues = options.values || options.allowedValues;
    const values = Array.isArray(rawValues)
      ? rawValues
      : String(rawValues).split(',').map((v: string) => v.trim()).filter(Boolean);
    
    if (values.length > 0) {
      return `${type.toUpperCase()}('${values.join("', '")}')`;
    }
  }

  // Handle length if provided
  if (options?.length && ['string', 'varchar', 'char', 'binary', 'varbinary', 'bit', 'tinyint', 'smallint', 'mediumint', 'integer', 'int', 'bigint'].includes(type)) {
    const base = SQL_TYPE_MAP[type] || 'VARCHAR';
    const typeName = base.includes('(') ? base.split('(')[0] : base;
    return `${typeName}(${options.length})`;
  }

  // Fallback to map or default
  return SQL_TYPE_MAP[type] || 'TEXT';
}

/**
 * Builds the SQL fragment for a column definition
 */
export function buildColumnSql(col: any): string {
  const sqlType = mapTypeToSql(col.type, col);
  const nullable = col.required ? 'NOT NULL' : 'NULL';
  const unique = col.unique ? 'UNIQUE' : '';
  let defaultVal = '';

  if (col.default !== undefined && col.default !== null && col.default !== '') {
    const d = String(col.default).trim();
    
    // Check if it's a SQL expression/function (ends with () or is a known keyword)
    const isExpression = d.endsWith('()') || 
                       ['CURRENT_TIMESTAMP', 'CURRENT_DATE', 'CURRENT_TIME', 'NULL'].includes(d.toUpperCase()) ||
                       d.startsWith('(');

    if (isExpression) {
      // MySQL 8.0+ / TiDB requires parentheses for some expressions
      if (d.endsWith('()') && !d.startsWith('(')) {
        defaultVal = `DEFAULT (${d})`;
      } else {
        defaultVal = `DEFAULT ${d}`;
      }
    } else if (typeof col.default === 'boolean') {
      defaultVal = `DEFAULT ${col.default ? 1 : 0}`;
    } else if (!isNaN(Number(d)) && col.type !== 'string' && col.type !== 'text') {
      defaultVal = `DEFAULT ${d}`;
    } else {
      // Escape single quotes for string literals
      defaultVal = `DEFAULT '${d.replace(/'/g, "''")}'`;
    }
  }

  // Special handling for primary key if it's named 'id' and type is integer
  const extra = (col.name === 'id' && (col.type === 'id' || col.type === 'integer')) ? 'AUTO_INCREMENT PRIMARY KEY' : '';
  
  // If it's a primary key but not auto increment (like UUID)
  const pkExtra = (col.name === 'id' && col.isPrimaryKey) ? 'PRIMARY KEY' : '';

  return `\`${col.name}\` ${sqlType} ${nullable} ${defaultVal} ${unique} ${extra} ${pkExtra}`.trim().replace(/\s+/g, ' ');
}
