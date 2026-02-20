import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'OtoEvery — Filo Yönetim Sistemi',
  description: 'Araçlarınızı, çalışanlarınızı ve tüm filo operasyonlarınızı tek bir platformdan yönetin.',
  keywords: 'filo yönetimi, araç takip, fleet management, otopark yönetimi',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
