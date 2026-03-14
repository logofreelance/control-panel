import { createDb, eq, sql, siteSettings } from '@modular/database';
import { ISettingsRepository, SiteSettings } from '@cp/settings-manager';

export class DrizzleSettingsRepository implements ISettingsRepository {
    private db: ReturnType<typeof createDb>;

    constructor(dbUrl: string) {
        this.db = createDb(dbUrl);
    }

    async get(): Promise<SiteSettings | null> {
        const [settings] = await this.db.select().from(siteSettings).limit(1);
        if (!settings) return null;

        return {
            id: settings.id,
            siteName: settings.siteName || '',
            siteTitle: settings.siteTitle || '',
            metaDescription: settings.metaDescription || '',
            faviconUrl: settings.faviconUrl || '',
            primaryColor: settings.primaryColor || '',
            updatedAt: settings.updatedAt || undefined
        };
    }

    async create(data: Partial<SiteSettings>): Promise<SiteSettings> {
        const insertResult: any = await this.db.insert(siteSettings).values({
            siteName: data.siteName || 'Modular Engine',
            siteTitle: data.siteTitle || 'Dashboard',
            metaDescription: data.metaDescription || null,
            faviconUrl: data.faviconUrl || null,
            primaryColor: data.primaryColor || '#059669',
        });

        const id = insertResult[0]?.insertId || insertResult.insertId;
        const [newSettings] = await this.db.select().from(siteSettings).where(eq(siteSettings.id, id));

        return {
            id: newSettings.id,
            siteName: newSettings.siteName || '',
            siteTitle: newSettings.siteTitle || '',
            metaDescription: newSettings.metaDescription || '',
            faviconUrl: newSettings.faviconUrl || '',
            primaryColor: newSettings.primaryColor || '',
            updatedAt: newSettings.updatedAt || undefined
        };
    }

    async update(id: number, data: Partial<SiteSettings>): Promise<void> {
        await this.db.update(siteSettings).set({
            siteName: data.siteName,
            siteTitle: data.siteTitle,
            metaDescription: data.metaDescription,
            faviconUrl: data.faviconUrl,
            primaryColor: data.primaryColor,
            // Increment config_version so backend-system workers detect this change
            configVersion: sql`${siteSettings.configVersion} + 1`,
            updatedAt: new Date()
        }).where(eq(siteSettings.id, id));
    }
}
