'use client';

import { createContext, useContext, ReactNode, useState } from 'react';
import { BRAND } from '@cp/config';

export interface GlobalSettings {
    siteName: string;
    siteTitle: string;
    primaryColor: string;
    faviconUrl: string;
    metaDescription?: string;
}

export interface SettingsContextType {
    settings: GlobalSettings;
    setSettings: (s: GlobalSettings) => void;
}

const defaultSettings: GlobalSettings = {
    siteName: BRAND.NAME,
    siteTitle: 'Control Panel',
    primaryColor: BRAND.PRIMARY_COLOR,
    faviconUrl: ''
};

const SettingsContext = createContext<SettingsContextType>({
    settings: defaultSettings,
    setSettings: () => {}
});

export const GlobalSettingsProvider = ({ 
    children, 
    initialSettings 
}: { 
    children: ReactNode, 
    initialSettings?: Partial<GlobalSettings> 
}) => {
    const [settings, setSettings] = useState<GlobalSettings>({
        ...defaultSettings,
        ...(initialSettings || {})
    });

    return (
        <SettingsContext.Provider value={{ settings, setSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};

export function useGlobalSettings() {
    return useContext(SettingsContext);
}
