import { Inter } from 'next/font/google';
import { cookies } from 'next/headers';
import './globals.css';
import { ToastProvider, ConfigProvider, GlobalSettingsProvider } from '@/modules/_core';
import { BRAND } from '@cp/config';
import { NavigationProgressWrapper } from './NavigationProgressWrapper';

const inter = Inter({ subsets: ['latin'] });


import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  
  let siteName = BRAND.NAME;
  let siteTitle = 'Control Panel';
  let description = `Management Engine for ${BRAND.NAME} Applications`;
  let faviconUrl = '';

  try {
    const settingsStr = cookieStore.get('site_settings')?.value;
    if (settingsStr) {
      const parsed = JSON.parse(decodeURIComponent(settingsStr));
      if (parsed.siteName) siteName = parsed.siteName;
      if (parsed.siteTitle) siteTitle = parsed.siteTitle;
      if (parsed.metaDescription) description = parsed.metaDescription;
      if (parsed.faviconUrl) faviconUrl = parsed.faviconUrl;
    }
  } catch {
    // Ignore parse errors, fallback to defaults
  }

  const metadata: Metadata = {
    title: `${siteName} - ${siteTitle}`,
    description,
  };

  if (faviconUrl) {
    metadata.icons = {
      icon: faviconUrl,
      shortcut: faviconUrl,
      apple: faviconUrl
    };
  }

  return metadata;
}

// Blocking script to sync localStorage to cookie AND apply theme
// This ensures cookie is set for subsequent server-side renders
const themeScript = `
(function() {
  try {
    var settings = localStorage.getItem('site_settings');
    if (settings) {
      var parsed = JSON.parse(settings);
      var color = parsed.primaryColor;
      if (color && /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)) {
        // Apply theme immediately
        document.documentElement.style.setProperty('--primary', color);
        document.documentElement.style.setProperty('--primary-glow', color + '26');
        // Sync to cookie for next SSR
        document.cookie = 'theme_color=' + encodeURIComponent(color) + ';path=/;max-age=31536000;SameSite=Lax';
      }
    }
  } catch (e) {}
})();
`;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Read theme from cookie on SERVER SIDE (sync, no flash)
  const cookieStore = await cookies();
  const themeColor = cookieStore.get('theme_color')?.value;
  
  let initialSettings = undefined;
  try {
      const settingsStr = cookieStore.get('site_settings')?.value;
      if (settingsStr) {
          initialSettings = JSON.parse(decodeURIComponent(settingsStr));
      }
  } catch {
      console.error('Failed to parse site_settings cookie');
  }

  // Validate color format
  const isValidColor = themeColor && /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(themeColor);
  const primaryColor = isValidColor ? themeColor : BRAND.PRIMARY_COLOR;
  const primaryGlow = primaryColor + '26';

  return (
    <html
      lang="en"
      suppressHydrationWarning
      style={{
        '--primary': primaryColor,
        '--primary-glow': primaryGlow,
      } as React.CSSProperties}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${inter.className} min-h-screen bg-slate-50`} suppressHydrationWarning>
        <NavigationProgressWrapper />
        <GlobalSettingsProvider initialSettings={initialSettings}>
          <ConfigProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </ConfigProvider>
        </GlobalSettingsProvider>
      </body>
    </html>
  );
}
