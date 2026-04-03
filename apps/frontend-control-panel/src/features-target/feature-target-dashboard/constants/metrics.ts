export const METRICS_CONFIG = [
    { key: 'activeRoutes', iconKey: 'activity' as const, color: 'bg-blue-500 text-white', iconBg: 'bg-white/20' },
    { key: 'heartbeat', iconKey: 'zap' as const, color: 'bg-amber-500 text-white', iconBg: 'bg-white/20' },
    { key: 'latency', iconKey: 'clock' as const, color: 'bg-violet-500 text-white', iconBg: 'bg-white/20' },
    { key: 'uptime', iconKey: 'shieldCheck' as const, color: 'bg-emerald-500 text-white', iconBg: 'bg-white/20' },
] as const;

export const INFRASTRUCTURE_CONFIG = [
    { key: 'cloudGateway', iconKey: 'cloud' as const },
    { key: 'masterSyncDb', iconKey: 'database' as const },
    { key: 'identityProtocol', iconKey: 'lock' as const },
] as const;

export const COMMAND_HUB_CONFIG = [
    { key: 'databaseSchema', iconKey: 'database' as const, iconColor: 'text-primary', routeKey: 'databaseSchema' as const },
    { key: 'nodeConfiguration', iconKey: 'terminal' as const, iconColor: 'text-amber-500', routeKey: null },
    { key: 'wipeNodeCache', iconKey: 'trash2' as const, iconColor: 'text-destructive', routeKey: null },
] as const;
