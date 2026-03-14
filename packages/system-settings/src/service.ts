/**
 * packages/settings/src/service.ts
 * 
 * Settings Service - Business Logic Layer
 */

import { DEFAULT_SITE_SETTINGS } from './config/constants';
import { SiteSettings } from './types';
import { ISettingsRepository } from './types/repository';

export interface ISettingsService {
    getSettings(): Promise<SiteSettings>;
    updateSettings(payload: Partial<SiteSettings>): Promise<void>;
}

export class SettingsService implements ISettingsService {
    constructor(private repo: ISettingsRepository) { }

    /**
     * Get site settings (or create default if none exist)
     */
    async getSettings(): Promise<SiteSettings> {
        const settings = await this.repo.get();

        if (!settings) {
            // Auto-seed default settings
            return this.repo.create(DEFAULT_SITE_SETTINGS);
        }

        return settings;
    }

    /**
     * Update site settings
     */
    async updateSettings(payload: Partial<SiteSettings>): Promise<void> {
        const settings = await this.getSettings();
        if (!settings.id) throw new Error('Settings not initialized');

        // Sanitize payload: Remove read-only or auto-managed fields
        // This prevents "value.toISOString is not a function" error because frontend sends strings for dates
        const { id, createdAt, updatedAt, ...cleanPayload } = payload as any;

        await this.repo.update(settings.id, cleanPayload);
    }
}
