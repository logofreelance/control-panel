'use client';

/**
 * RolesPermissionsView - Unified management for roles and permissions
 * Features: Tabbed interface, responsive layout, glassmorphic design
 */

import { useState } from 'react';
import { Button } from '@/components/ui';
import { TextHeading } from '@/components/ui/text-heading';
import { Icons, MODULE_LABELS } from '@/lib/config/client';
import { RolesTab } from './RolesTab';
import { PermissionsTab } from './PermissionsTab';
import { TargetLayout } from '@/components/layout/TargetLayout';
import { cn } from '@/lib/utils';

const L = MODULE_LABELS.rolesPermissions;


export const RolesPermissionsView = () => {
    const [activeTab, setActiveTab] = useState<'roles' | 'permissions'>('roles');

    return (
        <TargetLayout>
            <div className="relative pt-12 pb-20 space-y-8 animate-page-enter">
                {/* Header Section */}
                <header className="px-1">
                    <TextHeading size="h2" className="text-3xl sm:text-4xl mb-1 lowercase">
                        {L.title}
                    </TextHeading>
                    <p className="text-base text-muted-foreground lowercase">
                        {L.subtitle}
                    </p>
                </header>

                {/* Tab Navigation */}
                <div className="flex p-1 bg-muted/40 rounded-xl w-full max-w-sm">
                    <Button
                        variant={activeTab === 'roles' ? 'default' : 'ghost'}
                        onClick={() => setActiveTab('roles')}
                        className={cn(
                            "flex-1 gap-2 rounded-lg lowercase transition-all duration-300 h-10",
                            activeTab === 'roles' ? "shadow-sm" : "text-muted-foreground"
                        )}
                    >
                        <Icons.shield className="size-4" />
                        {L.tabs.roles}
                    </Button>
                    <Button
                        variant={activeTab === 'permissions' ? 'default' : 'ghost'}
                        onClick={() => setActiveTab('permissions')}
                        className={cn(
                            "flex-1 gap-2 rounded-lg lowercase transition-all duration-300 h-10",
                            activeTab === 'permissions' ? "shadow-sm" : "text-muted-foreground"
                        )}
                    >
                        <Icons.unlock className="size-4" />
                        {L.tabs.permissions}
                    </Button>
                </div>

                {/* Content Area */}
                <div className="min-h-[400px]">
                    {activeTab === 'roles' ? <RolesTab /> : <PermissionsTab />}
                </div>
            </div>
        </TargetLayout>
    );
};
