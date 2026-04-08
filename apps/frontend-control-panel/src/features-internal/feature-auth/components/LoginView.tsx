'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Icons, LABELS as L } from '@/lib/config/client';
import { LoginForm } from './LoginForm';
import { apiClient } from '@/lib/api-client';
import { env } from '@/lib/env';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
} from '@/components/ui';
import { TextHeading } from '@/components/ui/text-heading';

import { BRAND } from '@/lib/config';

type SystemState = 'loading' | 'no_database' | 'db_error' | 'need_install' | 'ready';

// Props dari Server Component (login/page.tsx)
interface LoginViewProps {
  initialSystem?: { ready: boolean; needInstall: boolean; error: string | null };
  initialBranding?: { siteName: string; primaryColor: string } | null;
}

const DecorativeBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
    <div className="absolute top-[-5%] left-[-20%] w-[300px] h-[300px] md:w-[650px] md:h-[650px] bg-muted/40 rounded-full animate-blob transition-all duration-1000" />
    <div className="absolute bottom-[-10%] right-[-10%] w-[250px] h-[250px] md:w-[550px] md:h-[550px] border-2 border-foreground/5 rounded-full animate-blob animation-delay-4000" />
    <div className="absolute top-[20%] right-[-10%] w-[200px] h-[200px] md:w-[420px] md:h-[420px] bg-foreground/5 rounded-[40px] md:rounded-[100px] rotate-12 animate-blob animation-delay-2000" />
    <div className="absolute bottom-[-5%] left-[5%] w-[220px] h-[220px] md:w-[480px] md:h-[480px] border-[1px] border-border/20 rounded-full animate-blob animation-delay-6000" />
    <div className="absolute top-[15%] left-[20%] w-16 h-16 md:w-32 md:h-32 border-[1.5px] border-foreground/5 rounded-xl md:rounded-3xl -rotate-12 animate-pulse" />
    <div className="absolute bottom-[25%] right-[20%] w-10 h-10 md:w-16 md:h-16 bg-primary/20 rounded-full animate-bounce duration-[10s]" />

    <div
      className="absolute inset-0 opacity-[0.03]"
      style={{
        backgroundImage: `radial-gradient(circle at 2px 2px, #000 1px, transparent 0)`,
        backgroundSize: '32px 32px',
      }}
    />
  </div>
);

const LoadingScreen = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-background">
    <div className="relative">
      <div className="absolute inset-0 bg-primary/5 blur-xl rounded-full scale-150 animate-pulse" />
      <div className="relative w-12 h-12 bg-card rounded-xl border border-border/50 shadow-sm flex items-center justify-center">
        <Icons.loading className="w-6 h-6 text-primary animate-spin" />
      </div>
    </div>
  </div>
);

const ErrorScreen = ({ error, onRetry }: { error: string; onRetry: () => void }) => (
  <div className="min-h-screen flex items-center justify-center bg-background p-6">
    <Card className="max-w-md w-full p-8 text-center animate-page-enter">
      <div className="w-14 h-14 mx-auto mb-6 rounded-2xl bg-destructive/10 flex items-center justify-center text-destructive">
        <Icons.error className="w-7 h-7" />
      </div>
      <TextHeading size="h3" className="mb-2">
        System Error
      </TextHeading>
      <p className="text-muted-foreground mb-8 text-sm leading-relaxed max-w-[280px] mx-auto">
        {error}
      </p>
      <Button
        variant="default"
        size="lg"
        onClick={onRetry}
        className="w-full"
      >
        <Icons.refresh className="w-4 h-4 mr-2" /> Try Again
      </Button>
    </Card>
  </div>
);

const InstallRedirectScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-background p-6">
    <Card className="max-w-md w-full p-8 text-center animate-page-enter">
      <div className="w-14 h-14 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center text-primary animate-bounce">
        <Icons.rocket className="w-7 h-7" />
      </div>
      <TextHeading size="h3" className="mb-2">
        {L.common.login.welcome}
      </TextHeading>
      <p className="text-muted-foreground mb-8 text-sm">{L.common.login.noAdminAccount}</p>
      <div className="w-8 h-8 mx-auto border-[3.5px] border-primary/20 border-t-primary rounded-full animate-spin"></div>
    </Card>
  </div>
);

export function LoginView({ initialSystem, initialBranding }: LoginViewProps) {
  // Derive initial state dari server props (bukan client-side fetch)
  const [systemState, setSystemState] = useState<SystemState>(() => {
    if (!initialSystem) return 'loading'; // Fallback jika SSR gagal
    if (initialSystem.error) return 'db_error';
    if (initialSystem.needInstall) return 'need_install';
    return 'ready';
  });
  const [systemError, setSystemError] = useState<string>(
    initialSystem?.error || ''
  );
  const [branding, setBranding] = useState<{ siteName: string; primaryColor: string }>({
    siteName: initialBranding?.siteName || BRAND.NAME,
    primaryColor: initialBranding?.primaryColor || BRAND.PRIMARY_COLOR,
  });

  const router = useRouter();

  // Apply branding + handle install redirect on mount (client-side only)
  useEffect(() => {
    if (initialBranding?.primaryColor) {
      const color = initialBranding.primaryColor;
      document.documentElement.style.setProperty('--primary', color);

      let glowValue = color;
      if (color.startsWith('#')) {
        glowValue = color + '15';
      } else if (color.includes('oklch') || color.includes('rgb')) {
        glowValue = `color-mix(in srgb, ${color}, transparent 90%)`;
      }
      document.documentElement.style.setProperty('--primary-glow', glowValue);
    }
    if (initialBranding?.siteName) {
      document.title = `${initialBranding.siteName} - ${L.common.auth.login}`;
    }
    if (initialSystem?.needInstall) {
      setTimeout(() => router.replace('/install'), 1500);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Client-side fallback jika SSR gagal (initialSystem undefined)
  const checkSystem = async () => {
    console.log('[LOGIN_VIEW] Starting client-side check, apiClient baseUrl:', env.API_URL);
    try {
      const data = await apiClient.get<any>('/system-status');
      console.log('[LOGIN_VIEW] system-status response:', data);
      if (!data.hasDbUrl || !data.isDbConnected) {
        setSystemState('db_error');
        setSystemError('database not available');
      } else if (!data.isAdminCreated) {
        setSystemState('need_install');
      } else {
        setSystemState('ready');
      }
    } catch (err: any) {
      console.error('[LOGIN_VIEW] System check error:', err);
      setSystemState('db_error');
      setSystemError(err?.message || 'backend unreachable');
    }
  };

  useEffect(() => {
    if (systemState === 'loading') {
      checkSystem();
    }
  }, [systemState]);

  if (systemState === 'loading') return <LoadingScreen />;
  if (systemState === 'no_database') return <ErrorScreen error={systemError} onRetry={() => window.location.reload()} />;
  if (systemState === 'db_error') return <ErrorScreen error={systemError} onRetry={() => window.location.reload()} />;
  if (systemState === 'need_install') return <InstallRedirectScreen />;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 md:p-6 relative overflow-hidden selection:bg-primary selection:text-primary-foreground">
      <DecorativeBackground />

      <div className="w-full max-w-[440px] relative z-10 animate-page-enter">
        <div className="flex flex-col items-center mb-8 md:mb-12">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-card border border-border/50 text-primary rounded-2xl flex items-center justify-center shadow-xl shadow-primary/5 mb-6 transition-transform hover:scale-105 duration-500">
            <Icons.rocket className="w-6 h-6 md:w-8 md:h-8" />
          </div>
          <TextHeading size="h2" className="text-center">
            {L.common.login.welcomeBack}
          </TextHeading>
          <p className="text-muted-foreground/70 mt-3 text-base md:text-lg font-light text-center max-w-[340px] mx-auto leading-relaxed">
            {L.common.login.enterCredentials}
          </p>
        </div>

        <Card>
          <CardContent className="pt-8">
            <LoginForm />
          </CardContent>

          <CardFooter className="justify-center border-t-0 bg-transparent pb-6">
            <div className="flex items-center gap-4 text-md text-muted-foreground/40">
              <div className="h-px w-8 bg-border/40" />
              <span>Protected Access</span>
              <div className="h-px w-8 bg-border/40" />
            </div>
          </CardFooter>
        </Card>

        <p className="mt-12 text-xs font-normal text-muted-foreground/40 text-center">
          {L.common.login.authorizedOnly}
        </p>
      </div>
    </div>
  );
}

