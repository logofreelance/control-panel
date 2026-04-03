'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useTargetRegistry } from '@/features-internal/feature-target-registry';
import { authApi } from '@/features-internal/feature-auth';
import { DASHBOARD_ROUTES } from '../config/routes';
import { DASHBOARD_CONFIG } from '../constants/ui-labels';
import { filterTargets, getTopTargets, countByStatus } from '../services/dashboard-stats';

export function useDashboard() {
    const { targets, loading, addTarget, saving, testConnection } = useTargetRegistry();

    const [showAddModal, setShowAddModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    const searchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsSearchFocused(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const filteredTargets = useMemo(
        () => filterTargets(targets, searchQuery),
        [targets, searchQuery]
    );

    const topTargets = useMemo(
        () => getTopTargets(targets, DASHBOARD_CONFIG.topTargetsLimit),
        [targets]
    );

    const onlineCount = useMemo(
        () => countByStatus(targets, 'online'),
        [targets]
    );

    const healthPercentage = useMemo(
        () => (targets.length > 0 ? Math.round((onlineCount / targets.length) * 100) : 0),
        [targets.length, onlineCount]
    );

    return {
        targets,
        loading,
        saving,
        addTarget,
        testConnection,
        searchQuery,
        setSearchQuery,
        isSearchFocused,
        setIsSearchFocused,
        searchRef,
        filteredTargets,
        topTargets,
        onlineCount,
        healthPercentage,
        lastSync: 'A few moments ago',
        showAddModal,
        setShowAddModal,
    };
}
