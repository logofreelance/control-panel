'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Icons } from '@/lib/config/client';
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from '@/components/ui/sidebar';

export interface MenuItem {
  id: string;
  label: string;
  href: string;
  Icon?: any;
  isIndex?: boolean;
}

interface AppSidebarProps {
  menuItems: MenuItem[];
  siteName: string;
}

export function AppSidebar({ menuItems, siteName }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <ShadcnSidebar variant="inset" collapsible="icon" className="border-none shadow-none bg-transparent font-instrument overflow-hidden">
      {/* Precision Navigation Container - TIGHT TO CONTENT */}
      <div className="h-[calc(100vh-2rem)] my-4 w-72 rounded-[40px] border border-border/40 bg-background/95 backdrop-blur-3xl shadow-xl shadow-foreground/5 flex flex-col overflow-hidden relative">
        
        {/* Header - Strong Presence */}
        <SidebarHeader className="flex h-20 shrink-0 items-center px-8 mt-2 border-b border-border/5">
          <Link href="/" className="flex items-center gap-3 w-full group/logo transition-all active:scale-95">
            <div className="shrink-0 aspect-square size-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
                <Icons.zap className="size-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-lg font-semibold text-foreground leading-none">{siteName}</span>
              <span className="text-xs font-medium text-muted-foreground/60 mt-1.5 leading-none">Unified core</span>
            </div>
          </Link>
        </SidebarHeader>

        <SidebarContent className="px-5 pt-8 no-scrollbar">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="gap-2.5">
                {menuItems.map((item) => {
                  const isActive = pathname === item.href || (item.isIndex && pathname === '/');
                  const IconComp = item.Icon;

                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton 
                        isActive={isActive} 
                        size="lg"
                        className={cn(
                          "h-12 px-2.5 rounded-2xl transition-all duration-300 relative group/nav gap-1",
                          isActive 
                            ? "bg-primary/5 text-primary" 
                            : "text-foreground/70 hover:bg-foreground/5 hover:text-foreground"
                        )}
                        render={<Link href={item.href} />}
                      >
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-full animate-in fade-in slide-in-from-left-2" />
                        )}
                        
                        {/* Compact naked icon container */}
                        <div className={cn(
                          "shrink-0 aspect-square size-9 flex items-center justify-center transition-all bg-transparent",
                          isActive ? "text-primary" : "text-foreground/50 group-hover/nav:text-primary"
                        )}>
                           {IconComp ? (
                             <IconComp className="size-[18px] transition-transform group-hover/nav:scale-110" />
                           ) : null}
                        </div>

                        <span className={cn(
                          "text-[15px] font-normal transition-all truncate",
                          isActive ? "text-foreground font-semibold" : "text-foreground/80 focus:text-foreground"
                        )}>
                          {item.label}
                        </span>

                        {isActive && (
                          <Icons.chevronRight className="ml-auto size-3.5 opacity-40 shrink-0" />
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* Minimalist Tech Footer - Improved Legibility */}
        <SidebarFooter className="p-6 mt-auto border-t border-border/5 group-data-[collapsible=icon]:hidden">
            <div className="flex items-center gap-3 px-1 py-1">
                <div className="shrink-0 aspect-square size-8 flex items-center justify-center text-primary/60 bg-transparent">
                    <Icons.shield className="size-4.5" />
                </div>
                <div className="flex flex-col text-left">
                    <span className="text-[11px] font-bold text-foreground/50 leading-none">Secured core</span>
                    <div className="flex items-center gap-2 mt-2 leading-none">
                        <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse ring-4 ring-emerald-500/10" />
                        <span className="text-xs font-medium text-muted-foreground/30">Stable protocol active</span>
                    </div>
                </div>
            </div>
        </SidebarFooter>
      </div>
    </ShadcnSidebar>
  );
}
