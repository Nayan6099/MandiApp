import type { Metadata } from 'next';
import { Suspense } from 'react';
import { TrendView } from '@/features/trend/trend-view';

export const metadata: Metadata = {
  title: 'Wholesale Crop Price Trends & History (7-90 Days)',
  description:
    'Analyze daily agricultural price trends, 7-day, 30-day, and 90-day price movement, modal rates, and market arrival volume across India.',
  alternates: {
    canonical: '/trend',
  },
  openGraph: {
    title: 'Wholesale Crop Price Trends & History (7-90 Days) | Mandi Bhav',
    description:
      'Analyze daily agricultural price trends, 7-day, 30-day, and 90-day price movement, modal rates, and market arrival volume across India.',
    url: '/trend',
  },
};

export default function TrendPage() {
  return (
    <Suspense>
      <TrendView />
    </Suspense>
  );
}
