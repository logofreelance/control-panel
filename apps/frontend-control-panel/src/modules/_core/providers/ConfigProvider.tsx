'use client';

/**
 * _core/providers/ConfigProvider.tsx
 * 
 * Pure Dependency Injection via React Context
 * Single source of truth for all config, messages, icons, labels, and APIs
 * 
 * 🤖 AI INSTRUCTIONS:
 * - NEVER import from module config/api or @repo/config directly in components
 * - ALWAYS use: const { defaults, msg, api, icons, labels } = useConfig()
 * - ESLint will ERROR on direct config imports
 */

import { createContext, useContext, ReactNode, useMemo } from 'react';
import {
    DEFAULTS,
    MSG,
    Icons,
    API_STATUS,
    TOAST_TYPE,
    MODULE_LABELS,
    COMMON_LABELS,
} from '@/lib/config/client';

// Import module APIs (only here - single injection point)
import { API as DatabaseSchemaAPI } from '@/features-target/feature-target-database-schema';

// ============================================
// TYPE DEFINITIONS
// ============================================

/**
 * Registry of all module API endpoints
 * Add new modules here as they're created
 */
interface ModuleApiRegistry {
    databaseSchema: typeof DatabaseSchemaAPI;
    // Future modules:
    // apiManagement: typeof ApiManagementAPI;
    // users: typeof UsersAPI;
}

/**
 * Labels registry - module-specific and common
 */
interface LabelsRegistry {
    mod: typeof MODULE_LABELS;      // Module-specific labels (databaseSchema, etc.)
    common: typeof COMMON_LABELS;   // Common labels (actions, status, etc.)
}

/**
 * Full typed context - TypeScript will enforce correct usage
 */
export interface ConfigContextType {
    // Centralized configuration
    defaults: typeof DEFAULTS;

    // Centralized messages (toast, validation, errors)
    msg: typeof MSG;

    // Centralized icons (Lucide only)
    icons: typeof Icons;

    // Centralized labels (UI text)
    labels: LabelsRegistry;

    // Constants
    API_STATUS: typeof API_STATUS;
    TOAST_TYPE: typeof TOAST_TYPE;

    // Module API endpoints (injected here)
    api: ModuleApiRegistry;
}

// ============================================
// CONTEXT CREATION
// ============================================

const ConfigContext = createContext<ConfigContextType | null>(null);

// ============================================
// PROVIDER COMPONENT
// ============================================

interface ConfigProviderProps {
    children: ReactNode;
}

export const ConfigProvider = ({ children }: ConfigProviderProps) => {
    // Memoize to prevent unnecessary re-renders
    const value = useMemo<ConfigContextType>(() => ({
        defaults: DEFAULTS,
        msg: MSG,
        icons: Icons,
        labels: {
            mod: MODULE_LABELS,
            common: COMMON_LABELS,
        },
        API_STATUS,
        TOAST_TYPE,
        api: {
            databaseSchema: DatabaseSchemaAPI,
        },
    }), []);

    return (
        <ConfigContext.Provider value={value}>
            {children}
        </ConfigContext.Provider>
    );
};

// ============================================
// HOOK - USE THIS IN ALL COMPONENTS/COMPOSABLES
// ============================================

/**
 * Access all injected configuration
 * 
 * @example
 * const { defaults, msg, api, icons, labels } = useConfig();
 * 
 * // Use labels
 * const L = labels.mod.databaseSchema;
 * const C = labels.common;
 * <span>{L.buttons.createSource}</span>
 * <button>{C.actions.save}</button>
 * 
 * // Use defaults
 * const limit = defaults.databaseSchema.resourceForm.defaultLimit;
 * 
 * // Use messages
 * addToast(msg.databaseSchema.success.sourceCreated, TOAST_TYPE.SUCCESS);
 * 
 * // Use API endpoints
 * await apiClient.get(api.databaseSchema.list);
 * 
 * // Use icons
 * <icons.database className="w-5 h-5" />
 */
export function useConfig(): ConfigContextType {
    const ctx = useContext(ConfigContext);

    if (!ctx) {
        throw new Error(
            'useConfig must be used within ConfigProvider. ' +
            'Wrap your app in <ConfigProvider> in layout.tsx'
        );
    }

    return ctx;
}

// ============================================
// EXPORTS
// ============================================

export { ConfigContext };
