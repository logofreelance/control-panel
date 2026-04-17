/**
 * stats-get/config.ts
 */

export const SQL_QUERIES = {
    GET_DB_NAME: 'SELECT DATABASE() as db',
    GET_TABLES_INFRA: `
        SELECT 
            TABLE_NAME as name, 
            TABLE_ROWS as rowCount, 
            DATA_LENGTH as dataBytes, 
            INDEX_LENGTH as indexBytes, 
            DATA_FREE as freeBytes 
        FROM information_schema.TABLES 
        WHERE TABLE_SCHEMA = ?
        ORDER BY (DATA_LENGTH + INDEX_LENGTH) DESC
    `,
    GET_TABLES_FALLBACK: 'SHOW TABLE STATUS'
};
