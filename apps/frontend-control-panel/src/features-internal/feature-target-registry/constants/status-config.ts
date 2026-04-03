import type { TargetSystemStatus } from '../types/target-registry.types';

export type StatusVariant = 'success' | 'destructive' | 'secondary' | 'warning';

export interface StatusConfig {
    dot: string;
    variant: StatusVariant;
    label: string;
}

export const STATUS_CONFIG: Record<TargetSystemStatus, StatusConfig> = {
    online: { dot: 'bg-emerald-500 animate-pulse', variant: 'success', label: 'Online' },
    offline: { dot: 'bg-red-500', variant: 'destructive', label: 'Offline' },
    unknown: { dot: 'bg-muted-foreground', variant: 'secondary', label: 'Unknown' },
    error: { dot: 'bg-amber-500', variant: 'warning', label: 'Error' },
};
