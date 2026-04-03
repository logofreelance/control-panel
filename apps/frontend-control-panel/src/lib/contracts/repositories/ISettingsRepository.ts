/**
 * @repo/contracts - ISettingsRepository
 */

import type { SiteSettings } from '../types';

export interface ISettingsRepository {
    get(): Promise<SiteSettings | null>;
    create(data: SiteSettings): Promise<SiteSettings>;
    update(id: number, data: Partial<SiteSettings>): Promise<void>;
}
