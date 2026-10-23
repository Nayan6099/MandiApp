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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mandibhav.in'),
  title: {
    default: 'Mandi Bhav – Daily Wholesale Mandi Prices Across India',
    template: '%s | Mandi Bhav',
  },
  description:
    'Live wholesale mandi prices from across India in 6 languages. Check daily rates for onion, tomato, wheat, pulses & more updated from AGMARKNET.',
  applicationName: 'Mandi Bhav',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Mandi Bhav – Daily Wholesale Mandi Prices Across India',
    description:
      'Live wholesale mandi prices from across India in 6 languages. Check daily rates for onion, tomato, wheat, pulses & more updated from AGMARKNET.',
    url: '/',
    siteName: 'Mandi Bhav',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mandi Bhav – Daily Wholesale Mandi Prices Across India',
    description:
      'Live wholesale mandi prices from across India in 6 languages. Check daily rates for onion, tomato, wheat, pulses & more updated from AGMARKNET.',
  },
  robots: {
    index: true,
    follow: true,
  },
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
