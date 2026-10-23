import type { Metadata, Viewport } from 'next';
// Self-hosted fonts (no request to Google). Each file only downloads when its script is on screen.
import '@fontsource-variable/noto-sans';
import '@fontsource-variable/noto-sans-devanagari';
import '@fontsource-variable/noto-sans-gurmukhi';
import '@fontsource-variable/noto-sans-gujarati';
import '@fontsource-variable/noto-sans-bengali';
import '@fontsource-variable/baloo-2';
import '@fontsource-variable/baloo-paaji-2';
import '@fontsource-variable/baloo-bhai-2';
import '@fontsource-variable/baloo-da-2';
import './globals.css';
import { MobileNav } from '@/components/mobile-nav';
import { Providers } from '@/components/providers';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { SkipLink } from '@/components/skip-link';

export const metadata: Metadata = {
  title: { default: 'Mandi Bhav – Daily mandi prices', template: '%s | Mandi Bhav' },
  description:
    'Daily wholesale mandi prices from across India in English, हिन्दी, ਪੰਜਾਬੀ, मराठी, ગુજરાતી and বাংলা. Source: AGMARKNET / data.gov.in.',
  applicationName: 'Mandi Bhav',
};

export const viewport: Viewport = {
  themeColor: '#1f5132',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-dvh">
        <Providers>
          <SkipLink />
          <SiteHeader />
          <main id="main" className="mx-auto w-full max-w-6xl px-4 pb-28 md:pb-12">
            {children}
          </main>
          <SiteFooter />
          <MobileNav />
        </Providers>
      </body>
    </html>
  );
}
