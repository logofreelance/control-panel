'use client';

/**
 * DatabaseSchemaListPage
 * 
 * Clean page wrapper that directs to the DatabaseSchemaView component.
 * This eliminates code duplication between the page and component.
 */

import { DatabaseSchemaView } from '../components/DatabaseSchemaView';

export function DatabaseSchemaListPage() {
  return <DatabaseSchemaView />;
}

export default DatabaseSchemaListPage;
