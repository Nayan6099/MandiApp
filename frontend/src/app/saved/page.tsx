import type { Metadata } from 'next';
import { SavedView } from '@/features/saved/saved-view';

export const metadata: Metadata = { title: 'Saved prices' };

export default function SavedPage() {
  return <SavedView />;
}
