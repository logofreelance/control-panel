/**
 * packages/storage/src/labels.ts
 * 
 * Storage Module Labels
 * Migrated from @cp/config
 */

export const STORAGE_LABELS = {
    title: 'STORAGE.TITLE',
    subtitle: 'STORAGE.SUBTITLE',

    buttons: {
        refresh: 'STORAGE.BUTTONS.REFRESH',
    },

    labels: {
        databaseStorage: 'STORAGE.LABELS.DATABASE_STORAGE',
        tables: 'STORAGE.LABELS.TABLES',
        active: 'STORAGE.LABELS.ACTIVE',
        largestTable: 'STORAGE.LABELS.LARGEST_TABLE',
        mostRows: 'STORAGE.LABELS.MOST_ROWS',
        indexRatio: 'STORAGE.LABELS.INDEX_RATIO',
        indexData: 'STORAGE.LABELS.INDEX_DATA',
        data: 'STORAGE.LABELS.DATA',
        index: 'STORAGE.LABELS.INDEX',
        overhead: 'STORAGE.LABELS.OVERHEAD',
        totalRows: 'STORAGE.LABELS.TOTAL_ROWS',
        rows: 'STORAGE.LABELS.ROWS',
        connectedTo: 'STORAGE.LABELS.CONNECTED_TO',
        databaseTables: 'STORAGE.LABELS.DATABASE_TABLES',
        tablesCount: 'STORAGE.LABELS.TABLES_COUNT',
        noTablesFound: 'STORAGE.LABELS.NO_TABLES_FOUND',
        noDatabaseConnected: 'STORAGE.LABELS.NO_DATABASE_CONNECTED',
        system: 'STORAGE.LABELS.SYSTEM',
        mb: 'STORAGE.LABELS.MB',
        na: 'STORAGE.LABELS.NA',
        percent: 'STORAGE.LABELS.PERCENT',
    },

    messages: {
        loadFailed: 'STORAGE.MESSAGES.LOAD_FAILED',
        connectionFailed: 'STORAGE.MESSAGES.CONNECTION_FAILED',
        uploadSuccess: 'STORAGE.MESSAGES.UPLOAD_SUCCESS',
        uploadFailed: 'STORAGE.MESSAGES.UPLOAD_FAILED',
        folderCreated: 'STORAGE.MESSAGES.FOLDER_CREATED',
        folderCreateFailed: 'STORAGE.MESSAGES.FOLDER_CREATE_FAILED',
        itemDeleted: 'STORAGE.MESSAGES.ITEM_DELETED',
        deleteFailed: 'STORAGE.MESSAGES.DELETE_FAILED',
        loadFilesFailed: 'STORAGE.MESSAGES.LOAD_FILES_FAILED',
        // Table delete messages
        confirmDelete: 'STORAGE.MESSAGES.CONFIRM_DELETE',
        deleteWarning: 'STORAGE.MESSAGES.DELETE_WARNING',
        cancel: 'STORAGE.MESSAGES.CANCEL',
        deleting: 'STORAGE.MESSAGES.DELETING',
        deleteTable: 'STORAGE.MESSAGES.DELETE_TABLE',
        tableDeleted: 'STORAGE.MESSAGES.TABLE_DELETED',

        // Hono Handlers
        tableNameRequired: 'STORAGE.MESSAGES.TABLE_NAME_REQUIRED',
        invalidTableName: 'STORAGE.MESSAGES.INVALID_TABLE_NAME',
        dbNameParseError: 'STORAGE.MESSAGES.DB_NAME_PARSE_ERROR',
        cleanupCompleted: 'STORAGE.MESSAGES.CLEANUP_COMPLETED',
        cleanupFailed: 'STORAGE.MESSAGES.CLEANUP_FAILED',
    },

    // New additions for Service Logs/Errors (Moved from constants if needed, or referenced)
    errors: {
        dbUrlMissing: 'STORAGE.ERROR.DB_URL_MISSING',
        dbConnectionFailed: 'STORAGE.ERROR.DB_CONNECTION_FAILED',
        statsFetchFailed: 'STORAGE.ERROR.STATS_FETCH_FAILED',
    },
    logs: {
        statsError: 'STORAGE.LOG.STATS_ERROR',
        cleanupDataSource: 'STORAGE.LOG.CLEANUP_DATA_SOURCE',
        cleanupResource: 'STORAGE.LOG.CLEANUP_RESOURCE',
        cleanupWarning: 'STORAGE.LOG.CLEANUP_WARNING',
        error: 'STORAGE.LOG.ERROR',
    }
};
