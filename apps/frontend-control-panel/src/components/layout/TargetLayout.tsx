'use client';

import { ReactNode, useState } from 'react';
import { useRouter, usePathname, useParams } from 'next/navigation';
import { Button, Sheet, SheetContent, SheetTrigger } from '@/components/ui';
import { Icons } from '@/lib/config/client';
import { cn } from '@/lib/utils';

interface TargetLayoutProps {
  children: ReactNode;
}

export function TargetLayout({ children }: TargetLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const nodeId = params.id as string;
  const [open, setOpen] = useState(false);

  // CATEGORIZED NAVIGATION DATA - NODE SPECIFIC ONLY
  const navigation = [
    {
      group: 'Operational Summary',
      items: [{ label: 'Node Dashboard', href: `/target/${nodeId}`, icon: Icons.activity }],
    },
    {
      group: 'System Monitoring',
      items: [
        {
          label: 'Analytics Monitor',
          href: `/target/${nodeId}/monitor-analytics`,
          icon: Icons.zap,
        },
        {
          label: 'Database Monitor',
          href: `/target/${nodeId}/monitor-database`,
          icon: Icons.monitor,
        },
      ],
    },
    {
      group: 'Data Infrastructure',
      items: [
        { label: 'Endpoints Builder', href: `/target/${nodeId}/routes`, icon: Icons.terminal },
        {
          label: 'Database Schema',
          href: `/target/${nodeId}/database-schema`,
          icon: Icons.workflow,
        },
        { label: 'Integration Docs', href: `/target/${nodeId}/integration`, icon: Icons.code },
      ],
    },
    {
      group: 'Access & Security',
      items: [
        { label: 'User Control', href: `/target/${nodeId}/users`, icon: Icons.users },
        {
          label: 'Access Roles',
          href: `/target/${nodeId}/roles-permissions`,
          icon: Icons.shieldCheck,
        },
        { label: 'API Credentials', href: `/target/${nodeId}/api-keys`, icon: Icons.key },
      ],
    },
  ];

  const NavContent = () => (
    <div className="flex flex-col gap-8 pb-12">
      {navigation.map((group) => (
        <div key={group.group} className="flex flex-col gap-2">
          <p className="text-base text-muted-foreground font-normal px-4 mb-2 lowercase">
            {group.group}
          </p>
          <nav className="flex flex-col gap-1">
            {group.items.map((item) => {
              const isActive = pathname === item.href;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all font-normal text-base',
                    isActive
                      ? 'bg-muted text-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                  )}
                >
                  <item.icon className={cn('size-5', isActive ? 'text-primary' : '')} />
                  {item.label}
                </a>
              );
            })}
          </nav>
        </div>
      ))}
    </div>
  );

  return (
    <div className="relative flex flex-col min-h-screen w-full bg-background font-instrument">
      {/* GLOBAL HEADER */}
      <header className="z-50 w-full px-2 md:px-4 pt-2 md:pt-4 pointer-events-none transition-all shrink-0 fixed top-0 left-0 right-0">
        <div className="mx-auto w-full max-w-7xl bg-card border-2 border-border h-16 rounded-2xl flex items-center justify-between px-3 md:px-8 pointer-events-auto shadow-none">
          <div className="flex items-center gap-2 md:gap-4">
            {/* MOBILE MENU TRIGGER */}
            <div className="lg:hidden">
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger
                  render={
                    <Button variant="ghost" size="icon">
                      <Icons.menu className="size-5" />
                    </Button>
                  }
                />
                <SheetContent
                  side="left"
                  className="w-72 p-6 bg-background border-r border-border overflow-y-auto no-scrollbar font-instrument"
                >
                  <div className="mb-10 pl-2 flex items-center gap-3">
                    <div className="size-8 rounded-lg bg-muted flex items-center justify-center text-primary">
                      <Icons.rocket className="size-4" />
                    </div>
                    <span className="text-xl font-semibold lowercase">navigation</span>
                  </div>
                  <NavContent />
                </SheetContent>
              </Sheet>
            </div>

            {/* SITE LOGO AND NAME */}
            <a href="/" className="flex items-center gap-3 px-1">
              <div className="size-10 shrink-0 rounded-xl bg-muted flex items-center justify-center text-primary hidden lg:flex">
                <Icons.rocket className="size-5" />
              </div>
              <span className="text-xl font-semibold text-foreground lowercase">
                backend engine
              </span>
            </a>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            {/* NOTIFICATION */}
            <Button variant="ghost" size="icon">
              <Icons.bell className="size-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER (SIDEBAR + CONTENT) */}
      <div className="flex flex-1 w-full max-w-7xl mx-auto px-3 md:px-4 pt-24 pb-4">
        {/* SIDEBAR - DESKTOP ONLY */}
        <aside className="hidden lg:block w-72 shrink-0 pr-6 relative">
          <div className="fixed top-24 w-64 h-[calc(100vh-120px)] overflow-y-auto no-scrollbar">
            <NavContent />
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 min-w-0 bg-background relative lg:mx-0 mx-2">
          {children}
        </main>
      </div>
    </div>
  );
}
