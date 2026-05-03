
/**
 * settings.store.ts
 * 
 * Synchronous in-memory store for settings.
 * Initialized once at startup.
 */

import { getSettings } from './list-get/model';
import { updateSetting } from './update-put/model';

class SettingsStore {
    private data: Record<string, any> = {};
    private isInitialized = false;

    async initialize(db: any) {
        if (this.isInitialized) return;
        try {
            console.log('[SETTINGS_STORE] Initializing from DB...');
            this.data = await getSettings(db);
            this.isInitialized = true;
            console.log('[SETTINGS_STORE] Initialized successfully.');
        } catch (err) {
            console.error('[SETTINGS_STORE] Initialization failed:', err);
        }
    }

    /**
     * Synchronous GET
     */
    get(key?: string): any {
        if (key) return this.data[key];
        return { ...this.data };
    }

    /**
     * Update memory immediately (Synchronous)
     * and persist to DB in background (Asynchronous)
     */
    update(db: any, settingsData: Record<string, any>, mapping: Record<string, string>) {
        console.log('[SETTINGS_STORE] Synchronous update started');
        
        for (const [frontendKey, dbKey] of Object.entries(mapping)) {
            const value = settingsData[frontendKey];
            if (value !== undefined) {
                // 1. Update memory immediately
                this.data[frontendKey] = value;
                
                // 2. Fire and Forget DB update
                updateSetting(db, dbKey, String(value ?? '')).catch(err => {
                    console.error(`[SETTINGS_STORE] Background DB update failed for ${dbKey}:`, err.message);
                });
            }
        }
        
        return true;
    }
}

export const settingsStore = new SettingsStore();
