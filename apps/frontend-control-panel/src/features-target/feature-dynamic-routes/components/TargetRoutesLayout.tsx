'use client';

import React, { useState } from 'react';
import { Icons } from '../config/icons';
import { cn } from '@/lib/utils';
import { Container } from '@/components/ui';
import { RouteBuilderView } from './builder/components/RouteBuilderView';
import { EndpointEditor } from './builder/components/EndpointEditor';
import { EndpointDetailView } from './builder/components/EndpointDetailView';
import { ApiTesterView } from './tester/components/ApiTesterView';
import { AuthRoutesView } from './auth/components/AuthRoutesView';
import { AuthRouteDetailView } from './auth/components/AuthRouteDetailView';
import { ErrorTemplatesView } from './templates/components/ErrorTemplatesView';
import { ApiExplorerView } from './explorer/components/ApiExplorerView';

interface TargetRoutesLayoutProps {
    targetId: string;
}

export function TargetRoutesLayout({ targetId }: TargetRoutesLayoutProps) {
    const [activeTab, setActiveTab] = useState('builder');
    const [subView, setSubView] = useState<{ view: string; id?: string } | null>(null);

    const tabs = [
        { id: 'builder', label: 'Route Builder', icon: Icons.plus },
        { id: 'explorer', label: 'Explorer', icon: Icons.search },
        { id: 'tester', label: 'Tester', icon: Icons.zap },
        { id: 'auth', label: 'Security & Auth', icon: Icons.lock },
        { id: 'templates', label: 'Error Templates', icon: Icons.fileText },
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
        <div className="min-h-screen bg-background relative">
            <Container>
                <div className="relative z-10 pt-12 pb-20 space-y-8">
                    <div className="space-y-6">
                        <div className="flex items-center gap-1 overflow-x-auto border-b border-border hide-scrollbar pb-2">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => handleTabChange(tab.id)}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl whitespace-nowrap transition-colors",
                                        activeTab === tab.id
                                            ? 'bg-foreground text-background'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                    )}
                                >
                                    <tab.icon className="size-4" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="min-h-[500px]">
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
                </div>
            </Container>
        </div>
    );
}
