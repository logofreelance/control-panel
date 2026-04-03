'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { TargetFormModal } from '@/features-internal/feature-target-registry/components/TargetFormModal';
import { Icons } from '../config/icons';
import { UI_LABELS } from '../constants/ui-labels';
import { DASHBOARD_ROUTES } from '../config/routes';
import { useDashboard } from '../hooks/useDashboard';
import { formatTargetId } from '../services/dashboard-stats';
import { DASHBOARD_CONFIG } from '../constants/ui-labels';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Input,
  Button,
  Skeleton,
} from '@/components/ui';
import { TextHeading } from '@/components/ui/text-heading';
import { InternalLayout } from '@/components/layout/InternalLayout';

/**
 * DecorativeHeroBackground
 */
const DecorativeHeroBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 select-none opacity-40">
    <div className="absolute top-[10%] left-[-20%] md:left-[-10%] w-64 md:w-[800px] h-64 md:h-[800px] bg-foreground/2 rounded-full animate-float" />
    <div className="absolute bottom-[20%] right-[-15%] md:right-[-10%] w-72 md:w-[900px] h-72 md:h-[900px] bg-foreground/1 rounded-full animate-float-slow" />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-size-[100px_100px] md:bg-size-[150px_150px]" />
  </div>
);

export function MainDashboardView() {
  const {
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
    showAddModal,
    setShowAddModal,
  } = useDashboard();

  return (
    <InternalLayout>
      {/* Hero Section */}
      <div className="relative overflow-hidden w-full border-b border-border/40 min-h-[50vh] flex flex-col justify-center">
        <DecorativeHeroBackground />
        
        <div className="container mx-auto px-4 md:px-12 pt-16 pb-20 relative z-10 font-instrument">
          {/* ... Hero Content ... */}
          <div className="w-full max-w-5xl mx-auto text-center flex flex-col items-center gap-10">
            <div className="max-w-4xl mx-auto">
              <TextHeading size="h1" className="mb-6 leading-[1.05] tracking-tight text-6xl md:text-7xl font-bold">
                Where <span className="bg-primary text-primary-foreground px-3 sm:px-4 py-0.5 sm:py-1 rounded-2xl mx-1 inline-block">focus</span> goes,<br />energy flows.
              </TextHeading>
              <p className="text-muted-foreground/80 text-lg md:text-xl font-normal leading-[1.6] max-w-2xl mx-auto opacity-70">
                Streamline your operational workflow with precision node management and real-time connectivity diagnostics.
              </p>
            </div>

            {/* Compact Search bar */}
            <div ref={searchRef} className="relative w-full max-w-lg mx-auto group/search">
              <div className="relative group transition-all duration-300">
                <Icons.search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/40 transition-colors group-focus-within:text-primary z-10" />
                <Input
                  className="pl-11 pr-14 h-12 rounded-2xl bg-background/50 backdrop-blur-md border-2 border-primary hover:border-primary focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none shadow-sm"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  placeholder="Search architecture..."
                />
              </div>
            </div>

            {/* High-Precision Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-6 pt-10 border-t border-border/5 w-full max-w-2xl mx-auto">
              {[
                { label: 'System health', value: `${healthPercentage}%` },
                { label: 'Cloud nodes', value: targets.length },
                { label: 'Active link', value: 'Online' },
                { label: 'Diagnostic', value: 'Protected' },
              ].map((metric, i) => (
                <div key={i} className="text-center group/metric opacity-90">
                  <p className="text-[10px] font-bold text-muted-foreground/40 mb-2 leading-none">
                    {metric.label}
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <div className="size-1.5 rounded-full bg-primary/20 group-hover/metric:bg-primary transition-colors" />
                    <p className="text-lg font-bold text-foreground/80 leading-none">
                      {metric.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto px-4 md:px-12 py-16 relative z-20 animate-page-enter">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-6xl mx-auto w-full">
            
            {/* Primary Action Card */}
            <Card className="h-full flex flex-col min-h-[500px] lg:min-h-[640px] bg-primary text-primary-foreground border-none p-2 overflow-hidden group rounded-[40px] shadow-xl shadow-primary/20">
              <div className="relative flex-1 bg-white/5 rounded-[32px] px-6 py-10 md:p-12 flex flex-col justify-between border border-white/5 overflow-hidden">
                <div className="space-y-12 relative z-10">
                  <div className="flex justify-between items-center">
                    <div className="size-14 bg-white/10 rounded-2xl flex items-center justify-center text-white border border-white/10 group-hover:scale-110 transition-transform duration-500 backdrop-blur-md">
                      <Icons.database className="size-7" />
                    </div>
                    <Badge variant="outline" className="px-4 py-1.5 border-white/20 bg-white/5 text-white/90 text-[11px] font-bold rounded-full font-instrument">
                      Node ecosystem
                    </Badge>
                  </div>

                  <div className="space-y-5">
                    <p className="text-[11px] font-bold text-white/30 tracking-tight">
                      System infrastructure
                    </p>
                    <TextHeading size="h2" className="text-white leading-tight font-instrument tracking-tight">
                      Consolidated <br /> infrastructure.
                    </TextHeading>
                    <p className="text-white/60 text-base md:text-lg font-normal leading-relaxed max-w-[340px] opacity-80">
                      Consolidate your distributed node registry into a single, high-precision control interface.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-12 relative z-10">
                  <div className="flex items-center gap-8">
                    {loading ? (
                      <Skeleton className="h-20 w-40 rounded-2xl bg-white/10" />
                    ) : (
                      <div className="flex items-center gap-8">
                        <span className="text-7xl md:text-8xl font-bold text-white leading-none tracking-tighter">
                          {targets.length.toString().padStart(2, '0')}
                        </span>
                        <div className="space-y-1.5 border-l border-white/10 pl-8">
                           <p className="text-xs font-bold text-white/40 leading-none">Active nodes</p>
                           <p className="text-xs font-normal text-white/20">System instances</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 w-full">
                    <Button
                      type="button"
                      size="lg"
                      onClick={() => setShowAddModal(true)}
                      className="relative z-30 flex-1 h-14 rounded-2xl bg-white text-primary hover:bg-white/95 transition-all hover:-translate-y-1 active:scale-[0.98] px-6 pointer-events-auto shadow-lg font-instrument"
                    >
                      <Icons.plus className="size-5 mr-2" />
                      Deploy System
                    </Button>
                    <Link href={DASHBOARD_ROUTES.targetSystems} className="block shrink-0">
                      <Button 
                        variant="outline" 
                        size="lg"
                        className="size-14 p-0 rounded-2xl border-white/20 bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-all hover:border-white/40 backdrop-blur-md"
                      >
                        <Icons.settings className="size-5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>

            {/* System Monitor List */}
            <Card className="h-full flex flex-col min-h-[500px] lg:min-h-[640px] p-2 border-border/40 bg-card/40 backdrop-blur-sm rounded-[40px] shadow-sm">
              <CardHeader className="px-8 py-8 pb-4">
                <div className="flex gap-4 items-start">
                  <div className="size-14 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary shrink-0 aspect-square">
                    <Icons.monitor className="size-7" />
                  </div>
                  <div className="font-instrument">
                    <TextHeading size="h4">Target system</TextHeading>
                    <p className="text-base text-muted-foreground/60 font-normal mt-1">
                      High-fidelity monitoring of your active infrastructure nodes.
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col overflow-hidden px-4">
                <div className="min-h-0 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  {loading ? (
                      <div className="flex flex-col gap-4">
                          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}
                      </div>
                  ) : topTargets.length > 0 ? (
                      <div className="flex flex-col gap-2">
                          {topTargets.map((target) => (
                              <Link
                                  key={target.id}
                                  href={DASHBOARD_ROUTES.target(target.id)}
                                  className={cn(
                                      "group flex items-center justify-between p-4 px-6 hover:bg-muted/30 transition-all rounded-[24px] border border-transparent hover:border-border/10",
                                      target.status === 'online' ? "bg-emerald-500/[0.02]" : "bg-destructive/[0.02]"
                                  )}
                              >
                                  <div className="flex items-center gap-4 min-w-0 flex-1">
                                      <div className="size-14 rounded-[18px] bg-muted/40 text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all flex items-center justify-center shrink-0 aspect-square border border-border/5">
                                          <Icons.network className="size-7" />
                                      </div>
                                      <div className="min-w-0 flex-1 flex flex-col gap-1.5 font-instrument">
                                          <p className="text-lg font-bold text-foreground truncate group-hover:text-primary transition-all leading-none">
                                              {target.name}
                                          </p>
                                          <div className="flex items-center gap-3">
                                              <p className="text-[11px] font-medium text-muted-foreground/40 leading-none">
                                                  {formatTargetId(target.id, DASHBOARD_CONFIG.idSliceLength)}
                                              </p>
                                              <div className={cn(
                                                "size-1.5 rounded-full",
                                                target.status === 'online' ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground/30"
                                              )} />
                                          </div>
                                      </div>
                                  </div>
                                  <Icons.chevronRight className="size-4 text-muted-foreground/20 group-hover:text-primary transition-all group-hover:translate-x-1" />
                              </Link>
                          ))}
                      </div>
                  ) : (
                      <div className="flex-1 flex flex-col items-center justify-center py-20 bg-background/20 rounded-[32px] border border-dashed border-border/40">
                          <Icons.network className="size-16 text-muted-foreground/10 mb-4" />
                          <p className="text-muted-foreground/40 font-medium text-xs">No active nodes detected</p>
                      </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
      </div>

      <TargetFormModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={addTarget}
        onTestConnection={testConnection}
        saving={saving}
      />
    </InternalLayout>
  );
}
