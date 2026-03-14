/**
 * packages/config/src/labels/index.ts
 * 
 * Labels aggregator - export all label sources
 */

export { COMMON_LABELS, type CommonLabels } from './common';
export { MODULE_LABELS, type ModuleLabels } from './modules';

// Convenience re-export for quick access
import { COMMON_LABELS } from './common';
import { MODULE_LABELS } from './modules';

// Combined labels object
export const LABELS = {
    common: COMMON_LABELS,
    modules: MODULE_LABELS,
} as const;

export type Labels = typeof LABELS;
