/**
 * packages/system-api/src/services/logs.ts
 *
 * API Logs Service
 * Pure Domain Logic
 */
import { IApiLogsRepository, LogData } from '../types/repository';

export class ApiLogsService {
    constructor(private repo: IApiLogsRepository) { }

    async list(limit: number = 100) {
        return this.repo.list(limit);
    }

    async log(data: LogData) {
        // Here we could add logic like filtering sensitive data before saving
        await this.repo.save(data);
    }
}
