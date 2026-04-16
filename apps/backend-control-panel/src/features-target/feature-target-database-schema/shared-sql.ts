/**
 * SQL Type Mapping for Database Schema
 */
export const SQL_TYPE_MAP: Record<string, string> = {
  string: 'VARCHAR(255)',
  integer: 'INT',
  number: 'INT',
  decimal: 'DECIMAL(10,2)',
  float: 'DECIMAL(10,2)',
  text: 'TEXT',
  longtext: 'TEXT',
  json: 'JSON',
  jsonb: 'JSON',
  boolean: 'TINYINT(1)',
  datetime: 'DATETIME',
  date: 'DATE',
  status: 'VARCHAR(50)',
  slug: 'VARCHAR(255)',
  relation: 'VARCHAR(36)',
};
