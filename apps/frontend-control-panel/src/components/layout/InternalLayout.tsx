'use client';

/**
 * InternalLayout - Refactor following Elite Minimalist Rules
 * 
 * STICKING TO RULES:
 * - No tracking-* (Strictly using default spacing)
 * - No text size < text-xs
 * - No text color opacity (Removed /60, opacity-*)
 * - Standard Button usage only (Removed manual className styling where possible)
 * - Lowercase Consistency: Enforced lowercase across all navigation and profile labels.
 */

import { useState, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Button,
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
  const router = useRouter();

  const handleLogout = useCallback(async () => {
    try {
      // 1. Backend Invalidation
      await authApi.logout();
    } catch (e) {
      console.warn('[LOGOUT] API call failed, continuing with client-side cleanup:', e);
    } finally {
      // 2. Client-side thorough cleanup
      if (typeof window !== 'undefined') {
        sessionStorage.clear();
        // Clear all except theme preferences if we want to keep them, 
        // but for security, clearing auth-specific tokens is more important.
        //localStorage.removeItem('auth_token'); // If using Bearer tokens too
        
        // 3. Final Hard Redirect (replace ensures no back navigation to auth)
        window.location.replace('/login');
      }
    }
  }, []);

  return (
    <div className="relative flex flex-col min-h-screen w-full overflow-hidden bg-background font-instrument">
      {/* THE LUXURY FLOATING CAPSULE */}
      <header className="sticky top-0 z-50 w-full px-2 md:px-4 pt-2 md:pt-4 pointer-events-none transition-all duration-300">
        <div className="mx-auto w-full max-w-7xl bg-background/80 backdrop-blur-md border border-border/40 h-14 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-between px-3 md:px-6 pointer-events-auto transition-all shadow-none">
          <div className="flex items-center gap-3 md:gap-6">
             {/* SITE LOGO AND NAME */}
             <Link href="/" className="flex items-center gap-2 md:gap-4 group px-1">
                <div className="size-9 md:size-10 aspect-square shrink-0 rounded-xl bg-primary flex items-center justify-center text-primary-foreground group-hover:scale-105 transition-transform duration-300">
                   <Icons.rocket className="size-4 md:size-5" />
                </div>
                <div className="flex flex-col">
                   <TextHeading as="h5" size="h5" weight="semibold" className="text-lg md:text-xl leading-none lowercase">
                      backend engine
                   </TextHeading>
                </div>
             </Link>
             
             <div className="h-4 md:h-6 w-px bg-border/20 mx-1 hidden sm:block" />
             
             {leftActions}
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {!hideRightActions && (
              <div className="flex items-center gap-2 md:gap-4">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-xl transition-all"
                >
                  <Icons.bell className="size-4 md:size-5 text-muted-foreground" />
                </Button>

                <DropdownMenu open={showProfileMenu} onOpenChange={setShowProfileMenu}>
                  <DropdownMenuTrigger render={
                    <Button 
                        variant="ghost" 
                        size="default" 
                        className="rounded-xl flex items-center gap-4 bg-transparent border-none p-0 h-auto"
                    >
                        <div className="size-8 md:size-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center transition-transform group-hover:scale-105 duration-300">
                           <Icons.shield className="size-4 md:size-5" />
                        </div>
                        <div className="flex-col items-start hidden sm:flex text-left gap-1">
                          <span className="text-sm md:text-base font-medium text-foreground leading-none lowercase">master operator</span>
                          <span className="text-xs md:text-sm font-normal text-muted-foreground leading-none lowercase">access protocol</span>
                        </div>
                    </Button>
                  } />
                  <DropdownMenuContent align="end" className="w-64 mt-3 rounded-xl border border-border/40 p-2 animate-in fade-in slide-in-from-top-2 bg-background shadow-2xl font-instrument flex flex-col gap-1">
                    <div className="p-4 mb-1 bg-muted/40 rounded-lg border border-border/10">
                      <p className="text-xs text-muted-foreground font-normal mb-2 lowercase">authentication status</p>
                      <p className="text-base font-normal text-foreground leading-none lowercase">root operator active</p>
                    </div>
                    
                    <DropdownMenuItem 
                        className="rounded-lg py-3 px-3 cursor-pointer text-muted-foreground hover:text-foreground font-normal text-base lowercase gap-3 transition-colors"
                        onClick={() => router.push('/settings/profile')}
                    >
                        <Icons.user className="size-4" />
                        <span>edit profile</span>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem 
                        className="rounded-lg py-3 px-3 cursor-pointer text-muted-foreground hover:text-foreground font-normal text-base lowercase gap-3 transition-colors"
                        onClick={() => router.push('/settings')}
                    >
                        <Icons.settings className="size-4" />
                        <span>preferences</span>
                    </DropdownMenuItem>
                    
                    <div className="h-px bg-border/40 my-1 mx-1" />
                    
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="rounded-lg flex items-center gap-3 py-3 px-3 text-destructive cursor-pointer hover:bg-destructive/10 transition-colors font-medium text-base lowercase"
                    >
                      <Icons.logout className="size-4" />
                      <span>logout account</span>
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
