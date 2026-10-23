import type { Metadata } from 'next';
import { HomeView } from '@/features/home/home-view';

export const metadata: Metadata = {
  title: 'Mandi Bhav – Daily Wholesale Mandi Prices Across India',
  description:
    'Live wholesale mandi prices from across India in 6 languages. Check daily rates for onion, tomato, wheat, pulses & more updated from AGMARKNET.',
  alternates: {
    canonical: '/',
  },
};

export default function HomePage() {
  return <HomeView />;
}
