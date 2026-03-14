// packages/config/src/client.ts
// Client-side specific configuration exports (React/UI dependencies)

// 1. Re-export everything from the main (server-safe) config
// This allows frontend to import { Icons, Labels, ENV } from '@cp/config/client'
export * from './index';

// 2. Export UI/React specific items
// ============================================
// ICONS - Centralized Lucide React Icons (Single Source)
// ============================================
export {
    Icons,
    MenuIcons,
    StatusIcons,
    HttpMethodStyles,
    DataTypeIcons,
    ToastIcons,
    getMenuItems,
    type LucideIcon,
    type IconKey,
    type MenuIconKey,
    type StatusIconKey,
    type HttpMethod,
    type DataType,
    type ToastIconType,
} from './icons';

// Re-export shared types/constants needed by client if any
// (Avoiding duplication, user should import core stuff from main path)
