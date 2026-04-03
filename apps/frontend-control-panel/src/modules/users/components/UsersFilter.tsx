'use client';

/**
 * UsersFilter - Filter bar for users list
 * Refactored to match Dashboard design standards (Flat UI)
 */

import { Select } from '@/components/ui';
import { Icons, MODULE_LABELS } from '@/lib/config/client';
import { PAGE_LIMITS } from '../constants';
import type { UsersFilterState as FilterType, Pagination, RoleInfo } from '../types';

const L = MODULE_LABELS.users;

interface UsersFilterProps {
    filter: FilterType;
    pagination: Pagination;
    totalUsers: number;
    roles: RoleInfo[];
    onFilterChange: (key: keyof FilterType, value: string) => void;
    onLimitChange: (limit: number) => void;
    onReset: () => void;
}

export const UsersFilter = ({
    filter,
    pagination,
    totalUsers,
    roles,
    onFilterChange,
    onLimitChange,
    onReset
}: UsersFilterProps) => {

    const hasActiveFilter = filter.search || filter.status !== 'all' || filter.role !== 'all' || filter.dateOrder !== 'newest';

    return (
        <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm shadow-slate-200/50">
            {/* Search and quick stats */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-1">
                    <Icons.search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder={L.labels.filterPlaceholder}
                        value={filter.search}
                        onChange={(e) => onFilterChange('search', e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-50 border-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white outline-none text-sm"
                    />
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg">
                    <span className="text-lg font-semibold text-slate-800">{totalUsers}</span>
                    <span className="text-xs text-slate-500">{L.labels.user}</span>
                </div>
            </div>

            {/* Filters row */}
            <div className="flex flex-wrap items-center gap-2">
                {/* Status filter */}
                <div className="w-32">
                    <Select
                        value={filter.status}
                        onChange={(e) => onFilterChange('status', e.target.value)}
                        size="sm"
                        fullWidth={true}
                        options={[
                            { label: L.labels.allStatuses, value: 'all' },
                            { label: L.labels.active, value: 'active' },
                            { label: L.labels.inactive, value: 'inactive' }
                        ]}
                    />
                </div>

                {/* Role filter - Dynamic from database */}
                <div className="w-32">
                    <Select
                        value={filter.role}
                        onChange={(e) => onFilterChange('role', e.target.value)}
                        size="sm"
                        fullWidth={true}
                        options={[
                            { label: L.labels.allRoles, value: 'all' },
                            ...roles.map(role => ({ label: role.display_name, value: role.name }))
                        ]}
                    />
                </div>

                {/* Date order */}
                <div className="w-32">
                    <Select
                        value={filter.dateOrder}
                        onChange={(e) => onFilterChange('dateOrder', e.target.value)}
                        size="sm"
                        fullWidth={true}
                        options={[
                            { label: L.labels.newest, value: 'newest' },
                            { label: L.labels.oldest, value: 'oldest' }
                        ]}
                    />
                </div>

                {/* Per page limit */}
                <div className="w-16">
                    <Select
                        value={String(pagination.limit)}
                        onChange={(e) => onLimitChange(Number(e.target.value))}
                        size="sm"
                        fullWidth={true}
                        options={PAGE_LIMITS.map(limit => ({ label: String(limit), value: String(limit) }))}
                    />
                </div>

                {/* Reset button */}
                {hasActiveFilter && (
                    <button
                        onClick={onReset}
                        className="px-3 py-2 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium hover:bg-slate-200 transition-colors flex items-center gap-1.5"
                    >
                        <Icons.close className="w-3.5 h-3.5" /> {L.buttons.clearFilters}
                    </button>
                )}
            </div>
        </div>
    );
};
