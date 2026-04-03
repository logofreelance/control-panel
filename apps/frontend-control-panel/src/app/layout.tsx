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


export const metadata = {
  title: `${BRAND.NAME} | Control Panel`,
  description: `Management Engine for ${BRAND.NAME} Applications`,
};

// Blocking script to sync localStorage to cookie AND apply theme
const themeScript = `
(function() {
  try {
    var storedColor = localStorage.getItem('theme_color') || '#FF4136';
    var storedPreset = localStorage.getItem('theme_preset') || 'default';
    
    // Apply immediately to prevent FLASH
    if (storedPreset !== 'default') {
      document.documentElement.classList.add('theme-' + storedPreset);
    }
    
    document.documentElement.style.setProperty('--primary', storedColor);
    document.documentElement.style.setProperty('--primary-glow', storedColor + '26');
    
    // Sync to cookies for next SSR
    document.cookie = 'theme_color=' + encodeURIComponent(storedColor) + ';path=/;max-age=31536000;SameSite=Lax';
    document.cookie = 'theme_preset=' + encodeURIComponent(storedPreset) + ';path=/;max-age=31536000;SameSite=Lax';
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
  const themePreset = cookieStore.get('theme_preset')?.value;

  // Validate color format
  const isValidColor = themeColor && /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(themeColor);
  const primaryColor = isValidColor ? themeColor : BRAND.PRIMARY_COLOR;
  const primaryGlow = primaryColor + '26';
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
