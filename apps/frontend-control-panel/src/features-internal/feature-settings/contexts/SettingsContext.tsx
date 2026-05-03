
'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import type { SiteSettings } from '../types/settings.types';
import { settingsApi } from '../api/settings.api';

interface SettingsContextType {
    settings: SiteSettings;
    updateSettings: (newSettings: SiteSettings) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ 
    children, 
    initialData 
}: { 
    children: React.ReactNode; 
    initialData: SiteSettings 
}) {
    const [settings, setSettings] = useState<SiteSettings>(initialData);

    const updateSettings = useCallback((newSettings: SiteSettings) => {
        // Update memory state only. NO API calls here to prevent re-renders/refreshes while typing.
        setSettings(newSettings);
    }, []);

    return (
        <SettingsContext.Provider value={{ settings, updateSettings }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettingsContext() {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettingsContext must be used within a SettingsProvider');
    }
    return context;
}
