import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CompareView } from '@/features/compare/compare-view';

export const metadata: Metadata = { title: 'Compare mandis' };

export default function ComparePage() {
  return (
    <Suspense>
      <CompareView />
    </Suspense>
  );
}
