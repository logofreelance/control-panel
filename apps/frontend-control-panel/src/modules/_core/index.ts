// _core module - barrel export
// Shared components, icons, composables, config, providers, and utilities

// export * from './icons'; // Deprecated
export {
    Icons,
    MenuIcons,
    StatusIcons,
    getMenuItems,
    HttpMethodStyles,
    DataTypeIcons,
    ToastIcons,
    type LucideIcon
} from '@/lib/config/client';
export * from './components';
export * from './composables';
// Note: ./config is deprecated - use useConfig() from ./providers instead
export * from './providers';
