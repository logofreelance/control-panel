import { TARGET_DASHBOARD_LABELS } from '../constants/ui-labels';

export function timeAgo(dateStr: string | null): string {
    if (!dateStr) return TARGET_DASHBOARD_LABELS.time.never;
    const safeDateStr = dateStr.includes('T') || dateStr.endsWith('Z') ? dateStr : dateStr.replace(' ', 'T') + 'Z';
    const diff = Date.now() - new Date(safeDateStr).getTime();
    if (diff < 0) return TARGET_DASHBOARD_LABELS.time.justNow;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return TARGET_DASHBOARD_LABELS.time.justNow;
    if (mins < 60) return TARGET_DASHBOARD_LABELS.time.minutesAgo(mins);
    const hours = Math.floor(mins / 60);
    if (hours < 24) return TARGET_DASHBOARD_LABELS.time.hoursAgo(hours);
    return TARGET_DASHBOARD_LABELS.time.daysAgo(Math.floor(hours / 24));
}

export function formatIdentityProtocol(id: string): string {
    return `HASH_${(id || '').toUpperCase()}`;
}
