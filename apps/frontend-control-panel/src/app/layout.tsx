import { Instrument_Sans } from 'next/font/google';
import { cookies } from 'next/headers';
import './globals.css';
import { ToastProvider, ConfigProvider } from '@/modules/_core';
import { BRAND } from '@/lib/config';
import { NavigationProgressWrapper } from './NavigationProgressWrapper';

const fontBrand = Instrument_Sans({ 
  subsets: ['latin'], 
  variable: '--font-sans',
  weight: ['400', '500', '600', '700']
});

import { ThemeInitializer } from './ThemeInitializer';

export const metadata = {
  title: `${BRAND.NAME} | Control Panel`,
  description: `Management Engine for ${BRAND.NAME} Applications`,
};

// Blocking script to sync localStorage to cookie AND apply theme
const themeScript = `
(function() {
  try {
    var storedColor = localStorage.getItem('theme_color');
    var storedPreset = localStorage.getItem('theme_preset');
    
    var html = document.documentElement;
    
    // 1. Apply Storage to HTML immediately (Flash Prevention)
    if (storedColor && storedColor !== 'null') {
      html.style.setProperty('--primary', storedColor);
      var glow = storedColor;
      if (storedColor.startsWith('#')) {
        glow = storedColor + '26';
      } else {
        glow = 'color-mix(in srgb, ' + storedColor + ', transparent 85%)';
      }
      html.style.setProperty('--primary-glow', glow);
      document.cookie = 'theme_color=' + encodeURIComponent(storedColor) + ';path=/;max-age=31536000;SameSite=Lax';
    }
    
    if (storedPreset && storedPreset !== 'null') {
      var themeClasses = Array.from(html.classList).filter(function(c) { return c.startsWith('theme-'); });
      themeClasses.forEach(function(c) { html.classList.remove(c); });
      
      if (storedPreset !== 'default') {
        html.classList.add('theme-' + storedPreset);
      }
      document.cookie = 'theme_preset=' + encodeURIComponent(storedPreset) + ';path=/;max-age=31536000;SameSite=Lax';
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
  const rawColor = cookieStore.get('theme_color')?.value;
  const rawPreset = cookieStore.get('theme_preset')?.value;

  // Clean values from 'null' strings or empty values
  const themeColor = (rawColor && rawColor !== 'null') ? rawColor : null;
  const themePreset = (rawPreset && rawPreset !== 'null') ? rawPreset : 'default';

  // Validate color format
  const isColorLikelyValid = themeColor && (themeColor.startsWith('#') || themeColor.startsWith('oklch') || themeColor.startsWith('rgb'));
  const primaryColor = isColorLikelyValid ? themeColor : BRAND.PRIMARY_COLOR;
  
  // Safe Glow processing
  let primaryGlow = primaryColor;
  if (primaryColor.startsWith('#')) {
    primaryGlow = primaryColor + '26';
  } else {
    primaryGlow = `color-mix(in srgb, ${primaryColor}, transparent 85%)`;
  }

  const presetClass = themePreset && themePreset !== 'default' ? `theme-${themePreset}` : '';


  return (
    <html
      lang="en"
      className={presetClass}
      suppressHydrationWarning
      style={{
        '--primary': primaryColor,
        '--primary-glow': primaryGlow,
      } as React.CSSProperties}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${fontBrand.variable} ${fontBrand.className} min-h-screen bg-background`} suppressHydrationWarning>
        <ThemeInitializer />
        <NavigationProgressWrapper />

        <ConfigProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </ConfigProvider>
      </body>
    </html>
  );
}
