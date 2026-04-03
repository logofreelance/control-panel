export const UI_LABELS = {
  badge: {
    brand: 'Node Registry 2.0',
  },
  hero: {
    headline: 'Where focus goes,<br/>energy flows.',
    subtitle: 'Streamline your operational workflow with precision node management and real-time connectivity diagnostics.',
    searchPlaceholder: 'Search environments, systems, or specific node IDs...',
  },
  stats: {
    title: 'Inventory Clusters',
    subtitle: 'Consolidated overview of all deployed systems and active link status.',
    badge: 'Node Ecosystem',
    activeLinks: (count: number) => `Currently Synchronizing ${count} Nodes`,
    registerNode: 'Deploy New Node',
    targetSystem: 'Environment Configuration',
  },
  nodePool: {
    title: 'Operational Monitor',
    subtitle: 'Real-time diagnostic stream and health status for your target infrastructure.',
    empty: 'No target systems detected in current registry.',
    noMatches: 'No active nodes found matching your query.',
  },
  nav: {
    account: 'Account',
    profileDetails: 'Profile Details',
    preferences: 'Preferences',
    signOut: 'Sign Out',
    systemUser: 'System User',
    consoleOperator: 'Console Operator',
  },
} as const;

export const DASHBOARD_CONFIG = {
  topTargetsLimit: 10,
  idSliceLength: 12,
} as const;
