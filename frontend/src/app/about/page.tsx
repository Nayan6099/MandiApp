import type { Metadata } from 'next';
import { AboutView } from '@/features/about/about-view';

export const metadata: Metadata = {
  title: 'About Mandi Bhav – AGMARKNET & Government Data Source',
  description:
    "Learn about Mandi Bhav's real-time integration with the Government of India's AGMARKNET API (data.gov.in) and how wholesale prices are recorded.",
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'About Mandi Bhav – AGMARKNET & Government Data Source | Mandi Bhav',
    description:
      "Learn about Mandi Bhav's real-time integration with the Government of India's AGMARKNET API (data.gov.in) and how wholesale prices are recorded.",
    url: '/about',
  },
};

export default function AboutPage() {
  return <AboutView />;
}
