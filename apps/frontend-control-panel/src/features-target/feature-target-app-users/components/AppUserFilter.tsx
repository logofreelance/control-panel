'use client';

/**
 * AppUserFilter - Refactored to Analytics Style (MonitorAnalyticsView.tsx)
 * 
 * STICKING TO RULES:
 * - No tracking-*
 * - No text size < text-xs
 * - No text color opacity (text-foreground/80)
 * - Standard Button usage only
 * 
 * UPDATE: Removed forced 'lowercase' transformation from search placeholder 
 * and select options to avoid 'overdoing' lowercase as per user feedback.
 */

import { Select, Button } from '@/components/ui';
import { Icons } from '../config/icons';
import { APP_USER_LABELS } from '../constants/ui-labels';
import { APP_USER_PAGE_LIMITS } from '../constants/app-user.constants';
import type { AppUsersFilterState as FilterType, AppUserPaginationState, AppUserRoleInfo } from '../types/app-user.types';

const L = APP_USER_LABELS;

interface AppUsersFilterProps {
    filter: FilterType;
    pagination: AppUserPaginationState;
    totalUsers: number;
    roles: AppUserRoleInfo[];
    onFilterChange: (key: keyof FilterType, value: string) => void;
    onLimitChange: (limit: number) => void;
    onReset: () => void;
}

export const AppUserFilter = ({
    filter,
    pagination,
    totalUsers,
    roles,
    onFilterChange,
    onLimitChange,
    onReset
}: AppUsersFilterProps) => {

    const hasActiveFilter = filter.search || filter.status !== 'all' || filter.role !== 'all' || filter.dateOrder !== 'newest';

    return (
        <section className="flex flex-col gap-6 w-full">
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 w-full">
                {/* Search Bar - Style from MonitorAnalyticsView */}
                <div className="relative w-full flex items-center h-11 sm:h-12 min-h-[44px] p-1 bg-muted border border-border rounded-xl overflow-hidden focus-within:border-primary transition-all">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <Icons.search className="size-4 text-muted-foreground" />
                    </div>

                    <input
                        placeholder={L.filter.searchPlaceholder}
                        className="flex-1 pl-11 pr-4 h-full bg-transparent border-none focus:outline-none text-sm placeholder:text-muted-foreground text-foreground font-normal"
                        value={filter.search}
                        onChange={(e) => onFilterChange('search', e.target.value)}
                    />
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 px-1">
                <div className="w-32">
                    <Select
                        value={filter.status}
                        onChange={(e) => onFilterChange('status', e.target.value)}
                        size="sm"
                        fullWidth
                        className="bg-background border border-border h-9 text-xs"
                        options={[
                            { label: 'All Statuses', value: 'all' },
                            { label: L.filter.active, value: 'active' },
                            { label: L.filter.inactive, value: 'inactive' }
                        ]}
                    />
                </div>
                <div className="w-32">
                    <Select
                        value={filter.role}
                        onChange={(e) => onFilterChange('role', e.target.value)}
                        size="sm"
                        fullWidth
                        className="bg-background border border-border h-9 text-xs"
                        options={[
                            { label: 'All Roles', value: 'all' },
                            ...roles.map(role => ({ label: role.display_name, value: role.name }))
                        ]}
                    />
                </div>
                <div className="w-32">
                    <Select
                        value={filter.dateOrder}
                        onChange={(e) => onFilterChange('dateOrder', e.target.value)}
                        size="sm"
                        fullWidth
                        className="bg-background border border-border h-9 text-xs"
                        options={[
                            { label: L.filter.newest, value: 'newest' },
                            { label: L.filter.oldest, value: 'oldest' }
                        ]}
                    />
                </div>
                <div className="w-20 ml-auto md:ml-0">
                    <Select
                        value={String(pagination.limit)}
                        onChange={(e) => onLimitChange(Number(e.target.value))}
                        size="sm"
                        fullWidth
                        className="bg-background border border-border h-9 text-xs"
                        options={APP_USER_PAGE_LIMITS.map(limit => ({ label: String(limit), value: String(limit) }))}
                    />
                </div>

                {hasActiveFilter && (
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={onReset}
                    >
                        <Icons.close className="size-3.5 mr-2" /> Clear Filters
                    </Button>
                )}
            </div>
        </section>
    );
};
