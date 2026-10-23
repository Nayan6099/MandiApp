import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CompareView } from '@/features/compare/compare-view';

export const metadata: Metadata = {
  title: 'Compare Crop Prices Across All Mandis in India',
  description:
    'Compare commodity rates across Indian mandis to discover the cheapest and highest wholesale prices with visual rate comparison bars.',
  alternates: {
    canonical: '/compare',
  },
  openGraph: {
    title: 'Compare Crop Prices Across All Mandis in India | Mandi Bhav',
    description:
      'Compare commodity rates across Indian mandis to discover the cheapest and highest wholesale prices with visual rate comparison bars.',
    url: '/compare',
  },
};

export default function ComparePage() {
  return (
    <Suspense>
      <CompareView />
    </Suspense>
  );
}
