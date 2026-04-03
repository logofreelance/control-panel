/**
 * feature-settings — API Layer
 * 
 * 🤖 AI: All HTTP calls for the Settings feature.
 * Uses the centralized `apiClient` with HttpOnly cookie auth.
 */

import { apiClient } from '@/lib/api-client';
import type { SiteSettings } from '../types/settings.types';

interface SettingsResponse {
    success: boolean;
    data?: SiteSettings;
    message?: string;
    error?: { code: string; message: string };
}

export const settingsApi = {
    /** Fetch all site settings */
    getAll: async (): Promise<SettingsResponse> => {
        return apiClient.get<SettingsResponse>('/settings');
    },

    /** Update site settings (partial update supported) */
    update: async (settings: Partial<SiteSettings>): Promise<SettingsResponse> => {
        return apiClient.put<SettingsResponse>('/settings', settings);
    },
};
