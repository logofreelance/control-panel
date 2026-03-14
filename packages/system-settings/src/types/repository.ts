import { SiteSettings } from '../types';

export interface ISettingsRepository {
    get(): Promise<SiteSettings | null>;
    create(data: Partial<SiteSettings>): Promise<SiteSettings>;
    update(id: number, data: Partial<SiteSettings>): Promise<void>;
}
