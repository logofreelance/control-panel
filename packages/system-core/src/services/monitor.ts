import { IMonitorService, LogData, MonitorAggregates } from '../types';
import { IMonitorRepository } from '../types/repository';

export class MonitorService implements IMonitorService {
    constructor(private repo: IMonitorRepository) { }

    async getStats() {
        const aggregates = await this.repo.getAggregateStats();
        const recentLogs = await this.repo.getRecentLogs(10);

        return {
            aggregates,
            recentLogs,
        };
    }
}
