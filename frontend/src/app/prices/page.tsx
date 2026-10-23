import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PriceListSkeleton } from '@/components/price-list';
import { PricesView } from '@/features/prices/prices-view';

export const metadata: Metadata = {
  title: "Today's Mandi Prices by State, District & Crop",
  description:
    "Search and filter today's agricultural wholesale market rates by state, district, APMC mandi, and crop with sortable price ranges.",
  alternates: {
    canonical: '/prices',
  },
  openGraph: {
    title: "Today's Mandi Prices by State, District & Crop | Mandi Bhav",
    description:
      "Search and filter today's agricultural wholesale market rates by state, district, APMC mandi, and crop with sortable price ranges.",
    url: '/prices',
  },
};

export default function PricesPage() {
  // Suspense: the view reads filters from the URL (?state=...), which is only known in the browser.
  return (
    <Suspense
      fallback={
        <div className="pt-24">
          <PriceListSkeleton />
        </div>
      }
    >
      <PricesView />
    </Suspense>
  );
}
