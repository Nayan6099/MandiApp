import type { Metadata } from 'next';
import { SavedView } from '@/features/saved/saved-view';

export const metadata: Metadata = {
  title: 'My Starred Mandis & Favorite Crop Prices',
  description:
    'Quickly monitor your starred crops and favorite local mandis with real-time modal prices and price trend shortcuts.',
  alternates: {
    canonical: '/saved',
  },
  openGraph: {
    title: 'My Starred Mandis & Favorite Crop Prices | Mandi Bhav',
    description:
      'Quickly monitor your starred crops and favorite local mandis with real-time modal prices and price trend shortcuts.',
    url: '/saved',
  },
};

export default function SavedPage() {
  return <SavedView />;
}
