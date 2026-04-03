'use client';

import { Skeleton } from '@/components/ui';

/**
 * DashboardSkeleton
 * 
 * A high-fidelity skeleton screen that mimics the MainDashboardView layout.
 * Used during route transitions within the dashboard segment.
 */
/**
 * DecorativeHeroBackground
 * 
 * Soft, moving shapes that add depth and a premium feel to the hero section.
 */
const DecorativeHeroBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 select-none">
    <div className="absolute top-[-10%] left-[-10%] w-[450px] h-[450px] bg-primary/5 rounded-full animate-blob" />
    <div className="absolute top-[15%] right-[-5%] w-[380px] h-[380px] bg-muted/25 rounded-[40px] animate-blob animation-delay-2000" />
    <div className="absolute top-[30%] left-[20%] w-[550px] h-[550px] border-2 border-primary/10 rounded-full animate-blob animation-delay-4000 scale-110" />
    <div className="absolute bottom-[20%] right-[10%] w-[320px] h-[160px] bg-primary/5 rounded-full rotate-45 animate-blob animation-delay-4000" />
  </div>
);

export function DashboardSkeleton() {
    return (
        <div className="container mx-auto px-6 md:px-12 py-12 animate-in fade-in duration-500">
            {/* Hero Section Skeleton with Background */}
            <div className="relative overflow-hidden w-full rounded-[40px] border border-border/10 mb-20">
                <DecorativeHeroBackground />
                <div className="w-full max-w-5xl mx-auto py-20 md:py-32 text-center flex flex-col items-center gap-12 relative z-10">
                    <div className="max-w-4xl mx-auto space-y-6">
                        <Skeleton className="h-16 w-full max-w-2xl mx-auto rounded-2xl bg-muted/20" />
                        <Skeleton className="h-20 w-full max-w-lg mx-auto rounded-xl bg-muted/10" />
                    </div>
                    <div className="relative w-full max-w-lg mx-auto">
                        <Skeleton className="h-13 w-full rounded-2xl bg-card border border-border/40" />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <Skeleton className="h-5 w-8 rounded bg-muted/20" />
                        </div>
                    </div>

                    {/* Compact Metrics Ribbon Skeleton */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 lg:gap-x-12 gap-y-6 pt-6 border-t border-border/10 w-full max-w-2xl mx-auto">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="space-y-3">
                                <Skeleton className="h-2 w-16 rounded-full bg-muted/10 mx-auto" />
                                <div className="flex items-center justify-center gap-2.5">
                                    <Skeleton className="size-1.5 rounded-full bg-primary/20" />
                                    <Skeleton className="h-6 w-16 rounded-lg bg-muted/5" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Featured Sections Skeleton with Higher Z-index */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto w-full relative z-20">
                {/* Redesigned Primary Card Skeleton - Fixed mobile clipping */}
                <div className="h-[580px] rounded-3xl bg-primary p-2 flex flex-col">
                    <div className="relative flex-1 bg-white/3 rounded-[32px] px-4 py-8 md:p-10 flex flex-col justify-between border border-white/5">
                        <div className="space-y-12">
                            <div className="flex justify-between items-start">
                                <div className="size-14 rounded-2xl bg-white/10 border border-white/10" />
                                <div className="h-6 w-20 rounded-lg bg-white/5 border border-white/10" />
                            </div>
                            <div className="space-y-4">
                                <div className="h-3 w-16 rounded-full bg-white/20" />
                                <div className="space-y-3">
                                    <div className="h-10 w-full max-w-xs rounded-xl bg-white/10" />
                                    <div className="h-10 w-2/3 rounded-xl bg-white/10" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-10">
                             <div className="flex items-center gap-6">
                                <div className="h-24 w-32 md:w-40 rounded-2xl bg-white/10" />
                                <div className="space-y-2 border-l border-white/10 pl-6 py-1">
                                    <div className="h-2 w-16 rounded-full bg-white/10" />
                                    <div className="h-2 w-24 rounded-full bg-white/10" />
                                </div>
                             </div>
                             <div className="flex gap-2 md:gap-3">
                                <div className="flex-1 h-14 rounded-2xl bg-white" />
                                <div className="size-14 rounded-2xl bg-white/10 border border-white/20" />
                             </div>
                        </div>
                    </div>
                </div>

                {/* Card 2 Skeleton - Optimized for mobile horizontal space */}
                <div className="h-[540px] rounded-3xl border border-border/40 bg-card p-4 md:p-8 flex flex-col relative">
                    <div className="flex items-start gap-4 md:gap-5 mb-10">
                        <div className="size-14 rounded-2xl bg-muted/20 shrink-0 aspect-square" />
                        <div className="space-y-2 mt-1">
                            <div className="h-6 w-32 rounded-lg bg-muted/10" />
                            <div className="h-4 w-48 rounded-lg bg-muted/5" />
                        </div>
                    </div>
                    <div className="space-y-3">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="flex items-center justify-between px-2 py-5 md:p-5 bg-muted/5 border border-muted/10 rounded-2xl">
                                <div className="flex items-center gap-3 md:gap-5 flex-1 p-0 min-w-0">
                                     <div className="size-12 rounded-xl bg-muted/10 shrink-0" />
                                     <div className="space-y-2 flex-1 min-w-0 flex flex-col">
                                        <div className="h-4 w-full max-w-[120px] rounded bg-muted/10" />
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-16 rounded bg-muted/5" />
                                            <div className="md:hidden h-3 w-10 rounded bg-muted/10" />
                                        </div>
                                     </div>
                                </div>
                                <div className="flex items-center gap-5 shrink-0 ml-4">
                                    <div className="hidden md:flex h-6 w-16 rounded-full bg-muted/10" />
                                    <div className="size-4 rounded bg-muted/10" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
