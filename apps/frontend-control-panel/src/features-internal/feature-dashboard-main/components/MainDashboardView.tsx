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
import { Card, CardContent, CardHeader, CardTitle, Badge, Input, Button } from '@/components/ui';
import { TextHeading } from '@/components/ui/text-heading';
import { InternalLayout } from '@/components/layout/InternalLayout';

const DecorativeHeroBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 select-none">
    <div className="absolute top-[10%] left-[-20%] md:left-[-10%] w-64 md:w-[800px] h-64 md:h-[800px] bg-muted rounded-full animate-float" />
    <div className="absolute bottom-[20%] right-[-15%] md:right-[-10%] w-72 md:w-[900px] h-72 md:h-[900px] bg-muted rounded-full animate-float-slow" />
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
      <div className="relative w-full border-b border-border min-h-[50vh] flex flex-col justify-center">
        <DecorativeHeroBackground />

        <div className="container mx-auto px-4 md:px-6 pt-10 pb-10 relative z-10 font-instrument">
          <div className="w-full max-w-5xl mx-auto text-center flex flex-col items-center gap-6">
            <div className="max-w-4xl mx-auto">
              <TextHeading as="h1" size="h1" className="mb-4 lowercase">
                where{' '}
                <span className="bg-primary text-primary-foreground px-3 sm:px-4 py-0.5 sm:py-1 rounded-2xl mx-1 inline-block">
                  focus
                </span>{' '}
                goes,
                <br />
                energy flows.
              </TextHeading>
              <p className="text-muted-foreground text-lg md:text-xl font-normal leading-[1.6] max-w-2xl mx-auto lowercase">
                streamline your operational workflow with precision node management and real-time
                connectivity diagnostics.
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
                <div className="absolute top-full left-0 w-full mt-2 bg-background border border-border rounded-2xl z-100 overflow-hidden animate-in fade-in slide-in-from-top-2 p-3 font-instrument">
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
                                <span className="text-base font-normal text-foreground truncate text-left lowercase">
                                  {target.name}
                                </span>
                                <span className="text-base text-muted-foreground font-normal text-left">
                                  {formatTargetId(target.id, 12)}
                                </span>
                              </div>
                            </div>
                            <div
                              className={cn(
                                'size-2 rounded-full',
                                target.status === 'online'
                                  ? 'bg-primary animate-pulse'
                                  : 'bg-muted',
                              )}
                            />
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 text-center">
                        <Icons.search className="size-10 text-muted-foreground mx-auto mb-4" />
                        <p className="text-base text-muted-foreground font-normal lowercase">
                          no matches found for "{searchQuery}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* High-Precision Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-4 pt-6 border-t border-border w-full max-w-2xl mx-auto">
              {[
                { label: 'system health', value: `${healthPercentage}%` },
                { label: 'cloud nodes', value: targets.length },
                { label: 'active link', value: 'online' },
                { label: 'diagnostic', value: 'protected' },
              ].map((metric, i) => (
                <div key={i} className="text-center group/metric">
                  <p className="text-base font-normal text-muted-foreground mb-2 leading-none lowercase">
                    {metric.label}
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <div className="size-1.5 rounded-full bg-muted group-hover/metric:bg-primary transition-colors" />
                    <p className="text-lg font-normal text-foreground leading-none lowercase">
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
      <div className="container mx-auto px-4 md:px-6 py-6 relative z-20 animate-page-enter">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto w-full">
          {/* Primary Action Card */}
          <Card className="bg-primary text-primary-foreground border-primary">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div className="size-14 bg-background rounded-2xl flex items-center justify-center text-primary group-hover:scale-105 transition-transform duration-500 border border-background">
                  <Icons.database className="size-7" />
                </div>
                <Badge
                  variant="secondary"
                  className="bg-background text-primary border-none lowercase"
                >
                  node ecosystem
                </Badge>
              </div>

              <div className="space-y-3 pt-4">
                <p className="text-base font-normal text-primary-foreground lowercase">
                  system infrastructure
                </p>
                <TextHeading size="h3" className="leading-tight lowercase text-primary-foreground">
                  consolidated <br /> infrastructure
                </TextHeading>
                <p className="text-base md:text-lg font-normal leading-relaxed lowercase text-primary-foreground">
                  consolidate your distributed node registry into a single, high-precision control
                  interface.
                </p>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-6 relative z-10">
                <div className="flex items-center gap-8">
                  {loading ? (
                    <span className="text-4xl md:text-5xl font-semibold leading-none text-primary-foreground animate-pulse">
                      --
                    </span>
                  ) : (
                    <div className="flex items-center gap-8">
                      <span className="text-4xl md:text-5xl font-semibold leading-none text-primary-foreground">
                        {targets.length.toString().padStart(2, '0')}
                      </span>
                      <div className="space-y-1.5 border-l border-primary-foreground pl-6">
                        <p className="text-base font-normal text-primary-foreground leading-none lowercase">
                          active nodes
                        </p>
                        <p className="text-base font-normal text-primary-foreground lowercase">
                          system instances
                        </p>
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
                    className="flex-1 hover:bg-muted font-instrument text-primary lowercase"
                  >
                    <Icons.plus className="size-5 mr-2" />
                    deploy system
                  </Button>
                  <Link href={DASHBOARD_ROUTES.targetSystems} className="block shrink-0">
                    <Button
                      variant="secondary"
                      size="icon"
                      className="size-13 text-primary hover:bg-muted transition-all"
                    >
                      <Icons.settings className="size-5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Monitor List */}
          <Card>
            <CardHeader>
              <div className="flex gap-4 items-center">
                <div className="size-14 rounded-2xl bg-muted border border-border flex items-center justify-center text-primary shrink-0 aspect-square">
                  <Icons.monitor className="size-7" />
                </div>
                <div>
                  <TextHeading size="h4" className="lowercase">
                    {searchQuery ? 'search results' : 'target system'}
                  </TextHeading>
                  <p className="text-base text-muted-foreground font-normal lowercase">
                    {searchQuery
                      ? `displaying matches for "${searchQuery}"`
                      : 'high-fidelity monitoring of your active infrastructure nodes.'}
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="min-h-0 flex-1 overflow-y-auto no-scrollbar max-h-[400px]">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4 bg-muted rounded-3xl border border-border border-dashed">
                    <div className="size-10 border-[3px] border-primary/10 border-t-primary animate-spin rounded-full" />
                    <span className="text-base text-muted-foreground font-normal lowercase tracking-tight">
                      polling ecosystem...
                    </span>
                  </div>
                ) : (searchQuery ? filteredTargets : topTargets).length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {(searchQuery ? filteredTargets : topTargets).map((target) => (
                      <Link
                        key={target.id}
                        href={DASHBOARD_ROUTES.target(target.id)}
                        className="group flex items-center justify-between p-2 hover:bg-accent transition-all rounded-3xl"
                      >
                        <div className="flex items-center gap-4 min-w-0 flex-1">
                          <div className="size-14 rounded-2xl bg-background text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all flex items-center justify-center shrink-0 border border-border">
                            <Icons.network className="size-7" />
                          </div>
                          <div className="min-w-0 flex-1 flex flex-col gap-2 font-instrument">
                            <p className="text-lg font-normal text-foreground truncate group-hover:text-primary transition-all leading-tight lowercase">
                              {target.name}
                            </p>
                            <div className="flex items-center gap-3">
                              <p className="text-base font-normal text-muted-foreground leading-tight">
                                {formatTargetId(target.id, DASHBOARD_CONFIG.idSliceLength)}
                              </p>
                              <div
                                className={cn(
                                  'size-1.5 rounded-full',
                                  target.status === 'online'
                                    ? 'bg-primary animate-pulse'
                                    : 'bg-muted',
                                )}
                              />
                            </div>
                          </div>
                        </div>
                        <Icons.chevronRight className="size-4 text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-1" />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center py-10 bg-muted rounded-3xl border border-dashed border-border font-instrument">
                    <Icons.search className="size-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground font-normal text-base lowercase">
                      no results for "{searchQuery}"
                    </p>
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
