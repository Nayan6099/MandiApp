import type { Metadata } from 'next';
import { Suspense } from 'react';
import { TrendView } from '@/features/trend/trend-view';

export const metadata: Metadata = { title: 'Price trend' };

export default function TrendPage() {
  return (
    <Suspense>
      <TrendView />
    </Suspense>
  );
}
