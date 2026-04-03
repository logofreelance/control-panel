'use client';

import { Select, Card, Button, Stack, Text } from '@/components/ui';
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
        <Card >
            <div className="p-5">
                <Stack direction="row" gap={3} align="center" className="flex-col sm:flex-row mb-4">
                    <div className="relative flex-1 w-full">
                        <Icons.search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder={L.filter.searchPlaceholder}
                            value={filter.search}
                            onChange={(e) => onFilterChange('search', e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background border border-border focus:border-foreground/30 focus:ring-0 outline-none text-sm transition-colors"
                        />
                    </div>
                    <Card  className="px-3 py-2 flex items-center gap-2">
                        <span className="text-lg font-semibold text-foreground">{totalUsers}</span>
                        <Text variant="detail">{L.filter.totalUsers}</Text>
                    </Card>
                </Stack>

                <Stack direction="row" gap={2} align="center" wrap>
                    <div className="w-32">
                        <Select
                            value={filter.status}
                            onChange={(e) => onFilterChange('status', e.target.value)}
                            size="sm"
                            fullWidth={true}
                            options={[
                                { label: L.filter.allStatuses, value: 'all' },
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
                            fullWidth={true}
                            options={[
                                { label: L.filter.allRoles, value: 'all' },
                                ...roles.map(role => ({ label: role.display_name, value: role.name }))
                            ]}
                        />
                    </div>
                    <div className="w-32">
                        <Select
                            value={filter.dateOrder}
                            onChange={(e) => onFilterChange('dateOrder', e.target.value)}
                            size="sm"
                            fullWidth={true}
                            options={[
                                { label: L.filter.newest, value: 'newest' },
                                { label: L.filter.oldest, value: 'oldest' }
                            ]}
                        />
                    </div>
                    <div className="w-16">
                        <Select
                            value={String(pagination.limit)}
                            onChange={(e) => onLimitChange(Number(e.target.value))}
                            size="sm"
                            fullWidth={true}
                            options={APP_USER_PAGE_LIMITS.map(limit => ({ label: String(limit), value: String(limit) }))}
                        />
                    </div>
                    {hasActiveFilter && (
                        <Button variant="outline" size="sm" onClick={onReset}>
                            <Icons.close className="size-3.5 mr-1" /> {L.filter.clear}
                        </Button>
                    )}
                </Stack>
            </div>
        </Card>
    );
};
