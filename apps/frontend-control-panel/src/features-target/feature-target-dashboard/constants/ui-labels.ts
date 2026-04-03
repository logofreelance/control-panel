export const TARGET_DASHBOARD_LABELS = {
    header: {
        pageBadge: 'Target Registry',
        separator: '/',
    },
    status: {
        online: 'Edge Connection Active',
        offline: 'Disconnected Node',
    },
    sync: {
        syncing: 'Syncing...',
        synchronize: 'Synchronize',
    },
    notFound: {
        title: 'Node not found',
        description: 'The system synchronized Node ID might have expired or rotated.',
        backToRegistry: 'Back to Registry',
    },
    metrics: {
        activeRoutes: 'Active Routes',
        heartbeat: 'Heartbeat',
        latency: 'Latency',
        uptime: 'Uptime',
    },
    infrastructure: {
        title: 'Infrastructure Stack',
        defaultDescription: 'This target system manages low-latency data routing and edge synchronization for distributed enterprise infrastructure.',
        cloudGateway: 'Cloud Gateway',
        cloudGatewayDefault: 'edge-discovery.io',
        masterSyncDb: 'Master Sync DB',
        identityProtocol: 'Identity Protocol',
    },
    connectivity: {
        title: 'Connectivity Log',
        subtitle: 'Historical Stability',
    },
    commandHub: {
        title: 'Command Hub',
        databaseSchema: 'Database Schema',
        nodeConfiguration: 'Node Configuration',
        wipeNodeCache: 'Wipe Node Cache',
    },
    integrity: {
        title: 'Service Integrity',
        status: '100.0',
        statusSuffix: '%',
        description: 'Last deep synchronization was successful across all edge nodes. No collisions detected.',
    },
    time: {
        never: 'Never',
        justNow: 'Just now',
        minutesAgo: (m: number) => `${m}m ago`,
        hoursAgo: (h: number) => `${h}h ago`,
        daysAgo: (d: number) => `${d}d ago`,
    },
} as const;
