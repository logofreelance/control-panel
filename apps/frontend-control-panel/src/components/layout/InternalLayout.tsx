'use client';

import { useState, useCallback, ReactNode } from 'react';
import Link from 'next/link';
import {
  Button,
  Avatar, 
  AvatarFallback, 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
} from '@/components/ui';
import { Icons } from '@/lib/config/client';
import { authApi } from '@/features-internal/feature-auth';
import { cn } from '@/lib/utils';
import { TextHeading } from '@/components/ui/text-heading';

interface InternalLayoutProps {
  children: ReactNode;
  leftActions?: ReactNode;
  hideRightActions?: boolean;
}

export function InternalLayout({ 
  children, 
  leftActions, 
  hideRightActions = false 
}: InternalLayoutProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (e) {}
    window.location.href = '/login';
  }, []);

  return (
    <div className="relative flex flex-col min-h-screen w-full overflow-hidden bg-background font-instrument">
      {/* THE LUXURY FLOATING CAPSULE - NO SHADOW, ENLARGED Branding */}
      <header className="sticky top-0 z-50 w-full px-2 md:px-4 pt-2 md:pt-4 pointer-events-none transition-all duration-300">
        <div className="mx-auto w-full max-w-7xl bg-background/80 backdrop-blur-md border border-border/40 h-14 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-between px-3 md:px-6 pointer-events-auto transition-all shadow-none">
          <div className="flex items-center gap-3 md:gap-6">
             {/* SITE LOGO AND NAME - OPTIMIZED FOR MOBILE */}
             <Link href="/" className="flex items-center gap-2 md:gap-4 group px-1">
                <div className="size-9 md:size-10 aspect-square shrink-0 rounded-xl bg-primary flex items-center justify-center text-primary-foreground group-hover:scale-105 transition-transform duration-300">
                   <Icons.rocket className="size-4 md:size-5" />
                </div>
                <div className="flex flex-col">
                   <TextHeading as="h5" size="h5" weight="semibold" className="text-sm md:text-xl leading-none">
                      Backend Engine
                   </TextHeading>
                </div>
             </Link>
             
             <div className="h-4 md:h-6 w-px bg-border/20 mx-1 hidden sm:block" />
             
             {leftActions}
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {!hideRightActions && (
              <div className="flex items-center gap-2 md:gap-4">
                <Button variant="ghost" size="icon" className="size-9 md:size-11 rounded-xl hover:bg-muted text-muted-foreground/60 transition-all">
                  <Icons.bell className="size-4 md:size-5" />
                </Button>

                <DropdownMenu open={showProfileMenu} onOpenChange={setShowProfileMenu}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-10 md:h-12 px-3 md:px-4 rounded-xl hover:bg-muted transition-all flex items-center gap-4 outline-none group bg-transparent border-none p-0">
                        <Avatar className="size-8 md:size-10 rounded-xl transition-transform group-hover:scale-105 duration-300">
                          <AvatarFallback className="bg-primary/5 text-primary">
                             <Icons.shield className="size-4 md:size-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-col items-start hidden sm:flex text-left gap-1">
                          <span className="text-sm md:text-base font-medium text-foreground leading-none">Master Operator</span>
                          <span className="text-xs md:text-sm font-normal text-muted-foreground leading-none opacity-50">Access protocol</span>
                        </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 mt-3 rounded-xl border border-border/40 p-2 animate-in fade-in slide-in-from-top-2 bg-background shadow-2xl font-instrument">
                    <div className="p-3 mb-1 bg-muted/40 rounded-lg border border-border/10">
                      <p className="text-xs text-muted-foreground font-normal mb-1 opacity-50">Authentication status</p>
                      <p className="text-base font-normal text-foreground leading-none">Root operator active</p>
                    </div>
                    <DropdownMenuItem className="p-0">
                      <Link href="/settings/profile" className="flex items-center gap-3 w-full rounded-lg py-3 px-3 cursor-pointer hover:bg-primary/5 transition-all text-muted-foreground hover:text-foreground">
                        <Icons.user className="size-4" />
                        <span className="text-base font-normal">Edit Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="p-0">
                      <Link href="/settings" className="flex items-center gap-3 w-full rounded-lg py-3 px-3 cursor-pointer hover:bg-primary/5 transition-all text-muted-foreground hover:text-foreground">
                        <Icons.settings className="size-4" />
                        <span className="text-base font-normal">Preferences</span>
                      </Link>
                    </DropdownMenuItem>
                    <div className="h-px bg-border/40 my-1 mx-1" />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="rounded-lg flex items-center gap-3 py-3 px-3 text-destructive cursor-pointer hover:bg-destructive/10 transition-colors"
                    >
                      <Icons.logout className="size-4" />
                      <span className="text-base font-normal">Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>
      </header>
      
      <main className="flex-1 w-full relative overflow-y-auto pt-0">
        {children}
      </main>
    </div>
  );
}
