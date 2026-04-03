import type { TargetSystem } from '@/features-internal/feature-target-registry/types/target-registry.types';

export function filterTargets(targets: TargetSystem[], query: string): TargetSystem[] {
    if (!query.trim()) return [];
    const lower = query.toLowerCase();
    return targets.filter(t =>
        t.name.toLowerCase().includes(lower) ||
        (t.description && t.description.toLowerCase().includes(lower))
    );
}

export function getTopTargets(targets: TargetSystem[], limit: number): TargetSystem[] {
    return targets.slice(0, limit);
}

export function countByStatus(targets: TargetSystem[], status: string): number {
    return targets.filter(t => t.status === status).length;
}

export function formatTargetId(id: string, length: number): string {
    return id.slice(0, length);
}
