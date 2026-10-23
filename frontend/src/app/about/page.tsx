import type { Metadata } from 'next';
import { AboutView } from '@/features/about/about-view';

export const metadata: Metadata = { title: 'About' };

export default function AboutPage() {
  return <AboutView />;
}
