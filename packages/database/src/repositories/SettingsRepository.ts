/**
 * packages/database/src/repositories/SettingsRepository.ts
 */

import { eq } from 'drizzle-orm';
import { siteSettings } from '../schema';
import type { DbType } from '../index';
import type { ISettingsRepository, SiteSettings } from '@modular/contracts';

export class SettingsRepository implements ISettingsRepository {
    constructor(private db: DbType) { }

    async get(): Promise<SiteSettings | null> {
        const [settings] = await this.db.select().from(siteSettings).limit(1);
        return (settings as unknown as SiteSettings) || null;
    }

    async create(data: SiteSettings): Promise<SiteSettings> {
        // Ensure ID is not set for insert if auto-increment
        const { id, ...insertData } = data;
        await this.db.insert(siteSettings).values(insertData as any);
        const [newSettings] = await this.db.select().from(siteSettings).limit(1);
        return newSettings as unknown as SiteSettings;
    }

    async update(id: number, data: Partial<SiteSettings>): Promise<void> {
        const { id: _, ...updateData } = data;
        await this.db.update(siteSettings).set(updateData).where(eq(siteSettings.id, id));
    }
}

