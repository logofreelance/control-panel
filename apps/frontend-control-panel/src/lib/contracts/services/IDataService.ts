/**
 * @repo/contracts - IDataService (Service Layer)
 */

import type { MutationResult, DataRowInput } from '../types';

export interface IDataService {
    insertRow(id: number, data: DataRowInput): Promise<MutationResult>;
    updateRow(id: number, rowId: number, data: DataRowInput): Promise<MutationResult>;
    deleteRow(id: number, rowId: number): Promise<MutationResult>;
    bulkInsert(id: number, rows: DataRowInput[]): Promise<MutationResult>;
    bulkDelete(id: number, rowIds: number[]): Promise<MutationResult>;
}
