/**
 * @modular/contracts - IDataRepository
 */

import type { DataSource, DataSourceSchema } from '../types';

export interface IDataRepository {
    findById(id: number): Promise<{ source: DataSource; schema: DataSourceSchema } | null>;
    updateSource(id: number, data: Partial<DataSource>): Promise<void>;

    // Dynamic Table Operations
    insertRow(tableName: string, columns: string[], values: unknown[]): Promise<number>;
    updateRow(tableName: string, id: number, updates: string[]): Promise<void>;
    deleteRow(tableName: string, id: number): Promise<void>;
    bulkInsert(tableName: string, columns: string[], valuesList: unknown[][]): Promise<void>;
    bulkDelete(tableName: string, ids: unknown[]): Promise<void>;
}

