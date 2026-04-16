/**
 * feature-target-database-schema/constants/index.ts
 * 
 * Local constants, labels, and messages for the Database Schema feature.
 * Decoupled from global config to ensure feature isolation.
 */

import { Icons } from '@/lib/config/client';

export const FEATURE_LABELS = {
    title: 'database schema',
    subtitle: 'manage your target database tables and structure',
    labels: {
        sources: 'sources',
        tables: 'tables',
        records: 'records',
        activeConnections: 'active connections',
        schemasDefined: 'schemas defined',
        totalRows: 'total rows',
        trash: 'trash',
        viewResources: 'view resources',
        hideResources: 'hide resources',
        tableData: 'table data',
        viewAndManageRecords: 'view and manage records',
        schema: 'schema',
        editColumnsTypes: 'edit columns & types',
        noEndpointsConfigured: 'no endpoints configured',
        createResourceToExpose: 'create resource to expose this table via API',
        public: 'public',
        protected: 'protected',
        filters: 'filters',
        active: 'active',
        draft: 'draft',
        hasJoins: 'has joins',
    },
    buttons: {
        createSchema: 'create schema',
        cloneSchema: 'clone schema',
        deleteSchema: 'delete schema',
        viewResources: 'view resources',
        hideResources: 'hide resources',
        viewData: 'view data',
        editSchema: 'edit schema',
        createResource: 'create resource',
        addRelation: 'add relation',
    },
    empty: {
        title: 'no schemas found',
        description: 'start by creating your first database table schema to begin managing data.',
    },
    messages: {
        confirm: {
            deleteSource: 'are you sure you want to delete this database schema? this will not delete the physical table but will remove the configuration.',
            deleteResource: 'are you sure you want to delete this API resource endpoint?',
        },
        relations: {
            title: 'Relations',
            addRelation: 'Connect tables',
        }
    }
};

export const FEATURE_MESSAGES = {
    success: {
        sourceCreated: 'database schema created successfully',
        sourceDeleted: 'database schema removed',
        sourceCloned: 'database schema cloned successfully',
        sourceArchived: 'database schema moved to trash',
        sourceRestored: 'database schema restored successfully',
        resourceCreated: 'api resource created successfully',
        resourceUpdated: 'api resource updated successfully',
        resourceDeleted: 'api resource removed',
        rowInserted: 'record added successfully',
        rowUpdated: 'record updated successfully',
        rowDeleted: 'record deleted successfully',
        rowsDeleted: (count: number) => `${count} records deleted successfully`,
    },
    error: {
        loadFailed: 'failed to load database schemas',
        cloneFailed: 'failed to clone database schema',
        archiveFailed: 'failed to archive database schema',
        restoreFailed: 'failed to restore database schema',
        resourceLoadFailed: 'failed to load api resources',
        resourceCreateFailed: 'failed to create api resource',
        resourceUpdateFailed: 'failed to update api resource',
        resourceDeleteFailed: 'failed to delete api resource',
        dataLoadFailed: 'failed to load table data',
        rowInsertFailed: 'failed to add record',
        rowUpdateFailed: 'failed to update record',
        rowDeleteFailed: 'failed to delete record',
    }
};

export const FEATURE_ICONS = Icons;
