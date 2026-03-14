/**
 * @modular/contracts - ISettingsService (Service Layer)
 */

import type { SiteSettings } from '../types';

export interface ISettingsService {
    getSettings(): Promise<SiteSettings>;
    updateSettings(payload: Partial<SiteSettings>): Promise<void>;
}

