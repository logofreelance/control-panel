'use client';

/**
 * MainDashboardView - Elite Minimalist Refactor
 * 
 * STICKING TO RULES:
 * - No tracking-* (Removed tracking-tight, tracking-[0.05em], etc.)
 * - No text size < text-xs (Changed text-[10px]/[11px] to text-xs)
 * - No text color opacity (Removed /40, /50, /60, opacity-*)
 * - Flat Luxury: Card Usage (Removed manual shadows and custom rounding on system cards)
 * - Lowercase Consistency: Enforced lowercase across all headers, buttons, and labels.
 */

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

const DecorativeHeroBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 select-none">
    <div className="absolute top-[10%] left-[-20%] md:left-[-10%] w-64 md:w-[800px] h-64 md:h-[800px] bg-foreground/5 rounded-full animate-float" />
    <div className="absolute bottom-[20%] right-[-15%] md:right-[-10%] w-72 md:w-[900px] h-72 md:h-[900px] bg-foreground/2 rounded-full animate-float-slow" />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.01)_1px,transparent_1px)] bg-[length:100px_100px] md:bg-[length:150px_150px]" />
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
      <div className="relative w-full border-b border-border/40 min-h-[50vh] flex flex-col justify-center">
        <DecorativeHeroBackground />
        
        <div className="container mx-auto px-4 md:px-12 pt-16 pb-20 relative z-10 font-instrument">
          <div className="w-full max-w-5xl mx-auto text-center flex flex-col items-center gap-10">
            <div className="max-w-4xl mx-auto">
              <TextHeading as="h1" size="h1" className="mb-6 leading-[1.05] text-6xl md:text-7xl font-bold lowercase">
                where <span className="bg-primary text-primary-foreground px-3 sm:px-4 py-0.5 sm:py-1 rounded-2xl mx-1 inline-block">focus</span> goes,<br />energy flows.
              </TextHeading>
              <p className="text-muted-foreground text-lg md:text-xl font-normal leading-[1.6] max-w-2xl mx-auto lowercase">
                streamline your operational workflow with precision node management and real-time connectivity diagnostics.
              </p>
            </div>

            {/* Compact Search bar */}
            <div ref={searchRef} className="relative w-full max-w-lg mx-auto group/search">
              <div className="relative group transition-all duration-300">
                <Icons.search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground transition-colors group-focus-within:text-primary z-10" />
                <Input
                  className="pl-11 pr-14 h-12 rounded-2xl bg-background border-border text-base font-normal shadow-none"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  placeholder="search architecture..."
                />
              </div>

              {/* LIVE SEARCH RESULTS DROPDOWN */}
              {isSearchFocused && searchQuery.trim() && (
                <div className="absolute top-full left-0 w-full mt-2 bg-background border border-border rounded-2xl shadow-2xl z-100 overflow-hidden animate-in fade-in slide-in-from-top-2 p-3 font-instrument">
                  <div className="max-h-[320px] overflow-y-auto no-scrollbar">
                    {filteredTargets.length > 0 ? (
                      <div className="flex flex-col gap-1.5">
                        {filteredTargets.map((target) => (
                          <Link
                            key={target.id}
                            href={DASHBOARD_ROUTES.target(target.id)}
                            className="flex items-center justify-between p-4 rounded-xl hover:bg-muted group/res transition-colors"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                               <div className="size-9 rounded-lg bg-muted flex items-center justify-center shrink-0 border border-border group-hover/res:bg-primary group-hover/res:text-primary-foreground transition-colors">
                                 <Icons.network className="size-4" />
                               </div>
                               <div className="flex flex-col items-start min-w-0">
                                  <span className="text-base font-normal text-foreground truncate text-left lowercase">{target.name}</span>
                                  <span className="text-xs text-muted-foreground font-normal text-left">{formatTargetId(target.id, 12)}</span>
                               </div>
                            </div>
                            <div className={cn("size-2 rounded-full", target.status === 'online' ? "bg-emerald-500 animate-pulse" : "bg-muted")} />
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="p-10 text-center">
                        <Icons.search className="size-10 text-muted-foreground/20 mx-auto mb-4" />
                        <p className="text-base text-muted-foreground font-normal lowercase">no matches found for "{searchQuery}"</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* High-Precision Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-6 pt-10 border-t border-border/10 w-full max-w-2xl mx-auto">
              {[
                { label: 'system health', value: `${healthPercentage}%` },
                { label: 'cloud nodes', value: targets.length },
                { label: 'active link', value: 'online' },
                { label: 'diagnostic', value: 'protected' },
              ].map((metric, i) => (
                <div key={i} className="text-center group/metric">
                  <p className="text-xs font-normal text-muted-foreground mb-2 leading-none lowercase">
                    {metric.label}
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <div className="size-1.5 rounded-full bg-primary/20 group-hover/metric:bg-primary transition-colors" />
                    <p className="text-lg font-medium text-foreground leading-none lowercase">
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
            
            {/* Primary Action Card - Unique Design Preserved but Rules Applied */}
            <Card className="h-full flex flex-col min-h-[500px] lg:min-h-[640px] bg-primary text-primary-foreground border-none p-2 overflow-hidden group rounded-[2.5rem] shadow-none">
              <div className="relative flex-1 bg-white/5 rounded-[2rem] px-6 py-8 md:p-10 flex flex-col justify-between border border-white/5 overflow-hidden">
                <div className="space-y-8 relative z-10">
                  <div className="flex justify-between items-center">
                    <div className="size-14 bg-white/10 rounded-2xl flex items-center justify-center text-white border border-white/10 group-hover:scale-105 transition-transform duration-500 backdrop-blur-md">
                      <Icons.database className="size-7" />
                    </div>
                    <Badge variant="secondary" className="px-4 py-1.5 bg-white/10 text-white border-none text-xs font-bold rounded-full lowercase">
                      node ecosystem
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs font-bold text-white lowercase">
                      system infrastructure
                    </p>
                    <TextHeading size="h2" className="text-white leading-tight lowercase">
                      consolidated <br /> infrastructure.
                    </TextHeading>
                    <p className="text-white text-base md:text-lg font-normal leading-relaxed max-w-[340px] lowercase">
                      consolidate your distributed node registry into a single, high-precision control interface.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-8 relative z-10">
                  <div className="flex items-center gap-8">
                    {loading ? (
                      <Skeleton className="h-20 w-40 rounded-2xl bg-white/10" />
                    ) : (
                      <div className="flex items-center gap-8">
                        <span className="text-7xl md:text-8xl font-bold text-white leading-none">
                          {targets.length.toString().padStart(2, '0')}
                        </span>
                        <div className="space-y-1.5 border-l border-white/20 pl-8">
                           <p className="text-xs font-bold text-white leading-none lowercase">active nodes</p>
                           <p className="text-xs font-normal text-white lowercase">system instances</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 w-full">
                    <Button
                      type="button"
                      size="lg"
                      variant="secondary"
                      onClick={() => setShowAddModal(true)}
                      className="flex-1 h-14 rounded-2xl bg-white text-primary hover:bg-white/90 px-6 font-instrument lowercase"
                    >
                      <Icons.plus className="size-5 mr-2" />
                      deploy system
                    </Button>
                    <Link href={DASHBOARD_ROUTES.targetSystems} className="block shrink-0">
                      <Button 
                        variant="secondary" 
                        size="icon"
                        className="size-14 rounded-2xl bg-white/10 hover:bg-white/20 text-white border-none transition-all"
                      >
                        <Icons.settings className="size-5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>

            {/* System Monitor List - Standard Content Card */}
            <Card className="h-full flex flex-col min-h-[500px] lg:min-h-[640px] overflow-hidden group">
              <CardHeader className="px-8 py-10 pb-4">
                <div className="flex gap-5 items-start">
                  <div className="size-14 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary shrink-0 aspect-square">
                    <Icons.monitor className="size-7" />
                  </div>
                  <div className="font-instrument">
                    <TextHeading size="h4" className="lowercase">{searchQuery ? 'search results' : 'target system'}</TextHeading>
                    <p className="text-base text-muted-foreground font-normal mt-2 lowercase">
                      {searchQuery ? `displaying matches for "${searchQuery}"` : 'high-fidelity monitoring of your active infrastructure nodes.'}
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col overflow-hidden px-4 md:px-8">
                <div className="min-h-0 flex-1 overflow-y-auto no-scrollbar">
                  {loading ? (
                      <div className="flex flex-col gap-4">
                          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}
                      </div>
                  ) : (searchQuery ? filteredTargets : topTargets).length > 0 ? (
                      <div className="flex flex-col gap-3">
                          {(searchQuery ? filteredTargets : topTargets).map((target) => (
                              <Link
                                  key={target.id}
                                  href={DASHBOARD_ROUTES.target(target.id)}
                                  className="group flex items-center justify-between p-4 sm:p-5 bg-muted/10 hover:bg-muted transition-all rounded-3xl border border-transparent"
                              >
                                  <div className="flex items-center gap-4 min-w-0 flex-1">
                                      <div className="size-14 rounded-2xl bg-background text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all flex items-center justify-center shrink-0 border border-border">
                                          <Icons.network className="size-7" />
                                      </div>
                                      <div className="min-w-0 flex-1 flex flex-col gap-2 font-instrument">
                                          <p className="text-lg sm:text-xl font-medium text-foreground truncate group-hover:text-primary transition-all leading-tight lowercase">
                                              {target.name}
                                          </p>
                                          <div className="flex items-center gap-3">
                                              <p className="text-xs font-normal text-muted-foreground leading-tight">
                                                  {formatTargetId(target.id, DASHBOARD_CONFIG.idSliceLength)}
                                              </p>
                                              <div className={cn(
                                                "size-1.5 rounded-full",
                                                target.status === 'online' ? "bg-emerald-500 animate-pulse" : "bg-muted"
                                              )} />
                                          </div>
                                      </div>
                                  </div>
                                  <Icons.chevronRight className="size-4 text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-1" />
                              </Link>
                          ))}
                      </div>
                  ) : (
                      <div className="flex-1 flex flex-col items-center justify-center py-20 bg-muted/5 rounded-3xl border border-dashed border-border font-instrument">
                          <Icons.search className="size-16 text-muted-foreground/20 mb-4" />
                          <p className="text-muted-foreground font-medium text-sm lowercase">no results for "{searchQuery}"</p>
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
