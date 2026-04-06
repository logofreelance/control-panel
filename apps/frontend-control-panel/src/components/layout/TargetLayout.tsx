'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useParams } from 'next/navigation';
import {
  Button,
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui';
import { Icons } from '@/lib/config/client';
import { cn } from '@/lib/utils';

interface TargetLayoutProps {
  children: ReactNode;
}

export function TargetLayout({ 
  children,
}: TargetLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const nodeId = params.id as string;
  const [open, setOpen] = useState(false);

  // CATEGORIZED NAVIGATION DATA - NODE SPECIFIC ONLY
  const navigation = [
    {
      group: "Operational Summary",
      items: [
        { label: 'Node Dashboard', href: `/target/${nodeId}`, icon: Icons.activity },
      ]
    },
    {
      group: "System Monitoring",
      items: [
        { label: 'Analytics Monitor', href: `/target/${nodeId}/monitor-analytics`, icon: Icons.zap },
        { label: 'Database Monitor', href: `/target/${nodeId}/monitor-database`, icon: Icons.monitor },
      ]
    },
    {
      group: "Data Infrastructure",
      items: [
        { label: 'Endpoints Builder', href: `/target/${nodeId}/routes`, icon: Icons.terminal },
        { label: 'Database Schema', href: `/target/${nodeId}/database-schema`, icon: Icons.workflow },
      ]
    },
    {
      group: "Access & Security",
      items: [
        { label: 'User Control', href: `/target/${nodeId}/users`, icon: Icons.users },
        { label: 'Access Roles', href: `/target/${nodeId}/roles-permissions`, icon: Icons.shieldCheck },
        { label: 'API Credentials', href: `/target/${nodeId}/api-keys`, icon: Icons.key },
      ]
    }
  ];

  const NavContent = () => (
    <div className="flex flex-col gap-8 pb-12 pt-6">
      {navigation.map((group) => (
        <div key={group.group} className="flex flex-col gap-2">
          <p className="text-xs text-muted-foreground font-normal px-4 mb-2">
            {group.group}
          </p>
          <nav className="flex flex-col gap-1">
            {group.items.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link 
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 font-normal text-base",
                    isActive 
                      ? "bg-muted text-foreground font-medium" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <item.icon className={cn("size-5 transition-colors", isActive ? "text-primary" : "")} />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
      ))}
    </div>
  );

  return (
    <div className="relative flex flex-col h-screen w-full overflow-hidden bg-background font-instrument">
      {/* GLOBAL HEADER */}
      <header className="z-50 w-full px-2 md:px-4 pt-2 md:pt-4 pointer-events-none transition-all duration-300 shrink-0">
        <div className="mx-auto w-full max-w-7xl bg-background/80 backdrop-blur-md border border-border/40 h-14 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-between px-3 md:px-8 pointer-events-auto transition-all shadow-none">
          
          <div className="flex items-center gap-2 md:gap-4">
             {/* MOBILE MENU TRIGGER */}
             <div className="lg:hidden">
               <Sheet open={open} onOpenChange={setOpen}>
                 <SheetTrigger render={
                   <Button variant="ghost" size="icon" className="size-9 rounded-xl hover:bg-muted">
                      <Icons.menu className="size-5" />
                   </Button>
                 } />
                 <SheetContent side="left" className="w-72 p-6 bg-background border-r border-border/40 overflow-y-auto no-scrollbar font-instrument">
                    <div className="mb-10 pl-2 flex items-center gap-3">
                       <div className="size-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
                          <Icons.rocket className="size-4" />
                       </div>
                       <span className="text-lg font-medium">Navigation</span>
                    </div>
                    <NavContent />
                 </SheetContent>
               </Sheet>
             </div>

            {/* SITE LOGO AND NAME */}
            <Link href="/" className="flex items-center gap-3 px-1">
              <div className="size-9 md:size-10 shrink-0 rounded-xl bg-primary flex items-center justify-center text-primary-foreground hidden lg:flex">
                <Icons.rocket className="size-4 md:size-5" />
              </div>
              <span className="text-lg md:text-xl font-medium text-foreground tracking-tight">
                Backend Engine
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {/* NOTIFICATION */}
            <Button variant="ghost" size="icon" className="size-9 md:size-11 rounded-xl text-muted-foreground hover:bg-muted transition-all border-none">
              <Icons.bell className="size-4 md:size-5" />
            </Button>

            {/* MAIN DASHBOARD BUTTON */}
            <Button 
              variant="default"
              className="size-9 md:size-auto md:h-11 md:px-6 rounded-xl text-sm md:text-base font-medium text-primary-foreground transition-all shadow-sm group flex items-center justify-center shrink-0"
              onClick={() => router.push('/')}
              title="Main Dashboard"
            >
              <Icons.layout className="size-4 md:size-5 md:mr-2.5" />
              <span className="hidden md:inline">Main Dashboard</span>
            </Button>
          </div>
        </div>
      </header>
      
      {/* MAIN CONTAINER (SIDEBAR + CONTENT) */}
      <div className="flex flex-1 overflow-hidden w-full max-w-7xl mx-auto md:px-4 pt-4 pb-4">
         {/* SIDEBAR - DESKTOP ONLY */}
         <aside className="hidden lg:flex flex-col w-72 shrink-0 pr-6 overflow-y-auto scrollbar-hide">
            <NavContent />
         </aside>

         {/* MAIN CONTENT AREA */}
         <main className="flex-1 bg-background overflow-y-auto relative lg:mx-0 mx-2 scrollbar-hide">
            {children}
         </main>
      </div>
    </div>
  );
}
