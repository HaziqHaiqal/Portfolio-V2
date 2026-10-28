import type { Metadata, Viewport } from 'next';
import { cookies } from 'next/headers';
import { Inter, Space_Grotesk } from 'next/font/google';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';
import { ThemeProvider } from '@components/Provider/ThemeProvider';
import { MaintenanceProvider } from '@components/Provider/MaintenanceProvider';
import { MotionProvider } from '@components/Provider/MotionProvider';
import { Analytics } from '@vercel/analytics/next';
import { ReactNode } from 'react';
import { SITE_URL } from '@lib/site';
import { THEME_CANVAS, THEME_COOKIE } from '@constants/theme';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  preload: false,
});

// The splash plays on the first page of a visit only; later pages open straight away.
const SPLASH_ONCE = `try{var d=document.documentElement;if(sessionStorage.getItem('splash-seen')){d.classList.add('splash-seen')}else{sessionStorage.setItem('splash-seen','1');setTimeout(function(){d.classList.add('splash-seen')},2500)}}catch(e){}`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Haziq Haiqal | Software Developer',
  description:
    'Developer by day, pianist by night. I build websites, mobile apps and automation.',
  keywords: [
    'Haziq Haiqal',
    'Software Developer',
    'React Developer',
    'TypeScript',
    'SAP ABAP',
    'Full Stack Developer',
    'Portfolio',
    'Web Development',
  ],
  authors: [{ name: 'Muhammad Haziq Haiqal Kamaruddin' }],
  creator: 'Haziq Haiqal',
  publisher: 'Haziq Haiqal',
  robots: 'index, follow',
  openGraph: {
    siteName: 'Haziq Haiqal Portfolio',
    locale: 'en_MY',
    type: 'website',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Haziq Haiqal | Software Developer',
  },
};

export async function generateViewport(): Promise<Viewport> {
  const cookieStore = await cookies();
  const isDarkMode = cookieStore.get(THEME_COOKIE)?.value !== 'light';
  const canvas = THEME_CANVAS[isDarkMode ? 'dark' : 'light'];

  return {
    colorScheme: isDarkMode ? 'dark' : 'light',
    themeColor: canvas,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const cookieStore = await cookies();
  const isDarkMode = cookieStore.get(THEME_COOKIE)?.value !== 'light';

  return (
    <html
      lang="en"
      className={isDarkMode ? 'dark scroll-smooth' : 'scroll-smooth'}
      data-scroll-behavior="smooth"
      style={{
        backgroundColor: THEME_CANVAS[isDarkMode ? 'dark' : 'light'],
        colorScheme: isDarkMode ? 'dark' : 'light',
      }}
      suppressHydrationWarning
    >
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} bg-gray-50 font-inter text-gray-900 antialiased dark:bg-gray-800 dark:text-gray-100`}
        suppressHydrationWarning
      >
        <script dangerouslySetInnerHTML={{ __html: SPLASH_ONCE }} />
        <ThemeProvider initialIsDarkMode={isDarkMode}>
          <MotionProvider>
            <MaintenanceProvider>{children}</MaintenanceProvider>
          </MotionProvider>
          <SpeedInsights />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
