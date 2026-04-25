/**
 * SQL Type Mapping for Database Schema
 */
export const SQL_TYPE_MAP: Record<string, string> = {
  // Identifiers
  id: 'VARCHAR(36)',
  uuid: 'CHAR(36)',
  // Numeric
  integer: 'INT',
  number: 'INT',
  bigint: 'BIGINT',
  decimal: 'DECIMAL(10,2)',
  float: 'DECIMAL(10,2)',
  // Text
  string: 'VARCHAR(255)',
  text: 'TEXT',
  longtext: 'TEXT',
  slug: 'VARCHAR(255)',
  email: 'VARCHAR(255)',
  phone: 'VARCHAR(50)',
  url: 'VARCHAR(2048)',
  // Date/Time
  datetime: 'DATETIME',
  date: 'DATE',
  timestamp: 'TIMESTAMP',
  // Structured
  json: 'JSON',
  jsonb: 'JSON',
  enum: 'VARCHAR(100)',
  // Boolean & Status
  boolean: 'TINYINT(1)',
  status: 'VARCHAR(50)',
  // Media
  image: 'VARCHAR(2048)',
  file: 'VARCHAR(2048)',
  // Relational
  relation: 'VARCHAR(36)',
};

/**
 * Maps a logical type to a physical SQL type.
 */
export function mapTypeToSql(type: string, options?: any): string {
  // Special case for ENUM
  if (type === 'enum' && options?.allowedValues) {
    const values = Array.isArray(options.allowedValues)
      ? options.allowedValues
      : String(options.allowedValues).split(',').map((v: string) => v.trim()).filter(Boolean);
    
    if (values.length > 0) {
      return `ENUM('${values.join("', '")}')`;
    }
  }

  // Fallback to map or default
  return SQL_TYPE_MAP[type] || 'TEXT';
}
