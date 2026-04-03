import React from 'react';
import Link from 'next/link';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Icons } from '@/lib/config/client';
import { Button } from '@/components/ui/button';

interface AppHeaderProps {
  userInitials: string;
  siteName: string;
  onProfileClick: () => void;
}

export function AppHeader({ userInitials, siteName, onProfileClick }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4 shadow-sm">
      <SidebarTrigger className="-ml-1" />
      
      <div className="flex flex-1 items-center gap-2 md:hidden">
        <span className="font-bold truncate text-foreground">{siteName}</span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onProfileClick} className="rounded-full">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-medium text-sm">
            {userInitials}
          </div>
        </Button>
      </div>
    </header>
  );
}
