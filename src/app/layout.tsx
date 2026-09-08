import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Radha Bali — Jelajahi Bali dengan AI Travel Assistant',
  description:
    'Temukan paket wisata terbaik di Bali dengan asisten AI. Rekomendasi personal, harga terjangkau, pengalaman tak terlupakan. Pantai, budaya, adventure — semua ada di Radha Bali.',
  keywords: ['Bali', 'travel', 'wisata', 'paket wisata', 'AI', 'chatbot', 'Radha Bali'],
  openGraph: {
    title: 'Radha Bali — AI-Powered Travel Experience',
    description: 'Temukan paket wisata terbaik di Bali dengan asisten AI personal.',
    type: 'website',
    locale: 'id_ID',
  },
};

import { LanguageProvider } from '@/contexts/LanguageContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
