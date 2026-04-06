'use client';

import React, { useState } from 'react';
import { Icons } from '../config/icons';
import { cn } from '@/lib/utils';
import { RouteBuilderView } from './builder/components/RouteBuilderView';
import { EndpointEditor } from './builder/components/EndpointEditor';
import { EndpointDetailView } from './builder/components/EndpointDetailView';
import { ApiTesterView } from './tester/components/ApiTesterView';
import { AuthRoutesView } from './auth/components/AuthRoutesView';
import { AuthRouteDetailView } from './auth/components/AuthRouteDetailView';
import { ErrorTemplatesView } from './templates/components/ErrorTemplatesView';
import { ApiExplorerView } from './explorer/components/ApiExplorerView';
import { TargetLayout } from '@/components/layout/TargetLayout';

interface TargetRoutesLayoutProps {
    targetId: string;
}

export function TargetRoutesLayout({ targetId }: TargetRoutesLayoutProps) {
    const [activeTab, setActiveTab] = useState('builder');
    const [subView, setSubView] = useState<{ view: string; id?: string } | null>(null);

    const tabs = [
        { id: 'builder', label: 'route builder', icon: Icons.plus },
        { id: 'explorer', label: 'explorer', icon: Icons.search },
        { id: 'tester', label: 'tester', icon: Icons.zap },
        { id: 'auth', label: 'security & auth', icon: Icons.lock },
        { id: 'templates', label: 'error templates', icon: Icons.fileText },
    ];

    const handleNavigate = (view: string, id?: string) => {
        setSubView({ view, id });
    };

    const handleBack = () => {
        setSubView(null);
    };

    const handleTabChange = (tabId: string) => {
        setActiveTab(tabId);
        setSubView(null);
    };

    return (
        <TargetLayout>
            <div className="flex flex-col gap-8 md:gap-10 animate-page-enter">
                {/* TABS - FLAT LUXURY DESIGN */}
                <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md pt-2 pb-4 border-b border-border/10">
                    <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar px-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id)}
                                className={cn(
                                    "flex items-center gap-2.5 sm:gap-3 px-5 sm:px-7 py-2.5 sm:py-3.5 text-sm sm:text-base font-medium rounded-2xl whitespace-nowrap transition-all active:scale-95 lowercase border-none",
                                    activeTab === tab.id
                                        ? 'bg-foreground text-background shadow-none'
                                        : 'bg-muted/40 text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                                )}
                            >
                                <tab.icon className={cn("size-4.5 sm:size-5 transition-transform", activeTab === tab.id && "scale-105")} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* CONTENT AREA */}
                <div className="min-h-[600px] w-full px-1">
                    {activeTab === 'builder' && !subView && (
                        <RouteBuilderView targetId={targetId} onNavigate={handleNavigate} />
                    )}
                    {activeTab === 'builder' && subView?.view === 'editor' && (
                        <EndpointEditor targetId={targetId} endpointId={subView.id} onBack={handleBack} />
                    )}
                    {activeTab === 'builder' && subView?.view === 'detail' && subView.id && (
                        <EndpointDetailView targetId={targetId} endpointId={subView.id} onNavigate={handleNavigate} onBack={handleBack} />
                    )}

                    {activeTab === 'auth' && !subView && (
                        <AuthRoutesView targetId={targetId} onNavigate={handleNavigate} />
                    )}
                    {activeTab === 'auth' && subView?.view === 'auth_detail' && subView.id && (
                        <AuthRouteDetailView targetId={targetId} routeId={subView.id} onBack={handleBack} onNavigate={handleNavigate} />
                    )}

                    {activeTab === 'explorer' && <ApiExplorerView targetId={targetId} />}
                    {activeTab === 'tester' && <ApiTesterView targetId={targetId} />}
                    {activeTab === 'templates' && <ErrorTemplatesView targetId={targetId} />}
                </div>
            </div>
        </TargetLayout>
    );
}
