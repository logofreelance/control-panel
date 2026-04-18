'use client';

import React, { useState } from 'react';
import { Icons } from '../config/icons';
import { cn } from '@/lib/utils';
import { RouteBuilderView } from './builder/components/RouteBuilderView';
import { EndpointEditor } from './builder/components/EndpointEditor';
import { EndpointDetailView } from './builder/components/EndpointDetailView';
import { ApiTesterView } from './tester/components/ApiTesterView';
import { ErrorTemplatesView } from './templates/components/ErrorTemplatesView';
import { TargetLayout } from '@/components/layout/TargetLayout';
import { Button } from '@/components/ui';

interface TargetRoutesLayoutProps {
  targetId: string;
}

export function TargetRoutesLayout({ targetId }: TargetRoutesLayoutProps) {
  const [activeTab, setActiveTab] = useState('builder');
  const [subView, setSubView] = useState<{ view: string; id?: string } | null>(null);
  const [testerPreFill, setTesterPreFill] = useState<{ method: string; path: string } | null>(null);

  const tabs = [
    { id: 'builder', label: 'route builder', icon: Icons.plus },
    { id: 'tester', label: 'tester', icon: Icons.zap },
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

  const handleTestEndpoint = (method: string, path: string) => {
    setTesterPreFill({ method, path });
    setActiveTab('tester');
    setSubView(null);
  };

  return (
    <TargetLayout>
      <div className="flex flex-col gap-8">
        {/* TABS NAVIGATION - ONLY AREA REQUESTED */}
        <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md pt-2 pb-4">
          <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar px-1">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'secondary'}
                onClick={() => handleTabChange(tab.id)}
                className={cn(
                  'h-11 px-6 rounded-xl lowercase font-normal text-base border-none',
                  activeTab !== tab.id && 'bg-muted/40 text-muted-foreground hover:bg-muted/60'
                )}
              >
                <tab.icon className="size-4 mr-2" />
                {tab.label}
              </Button>
            ))}
          </div>
        </div>

        {/* CONTENT AREA - RESTORED ORIGINAL LOGIC */}
        <div className="min-h-[600px] w-full px-1">
          {activeTab === 'builder' && !subView && (
            <RouteBuilderView targetId={targetId} onNavigate={handleNavigate} />
          )}
          {activeTab === 'builder' && subView?.view === 'editor' && (
            <EndpointEditor targetId={targetId} endpointId={subView.id} onBack={handleBack} />
          )}
          {activeTab === 'builder' && subView?.view === 'detail' && subView.id && (
            <EndpointDetailView
              targetId={targetId}
              endpointId={subView.id}
              onNavigate={handleNavigate}
              onBack={handleBack}
            />
          )}

          {activeTab === 'tester' && <ApiTesterView targetId={targetId} />}
          {activeTab === 'templates' && <ErrorTemplatesView targetId={targetId} />}
        </div>
      </div>
    </TargetLayout>
  );
}
