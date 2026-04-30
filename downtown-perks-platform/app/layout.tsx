import './globals.css';
import { DM_Serif_Display, Inter } from 'next/font/google';
import { Header } from '@/components/Header';
import type { Metadata } from 'next';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
});

const dmSerif = DM_Serif_Display({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-display',
});

export const metadata: Metadata = {
  title: 'Downtown Perks',
  description: 'The downtown ecosystem connecting resident discovery, partner proof, and map-first neighborhood behavior.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${dmSerif.variable}`}>
        <Header />
        {children}
      </body>
    </html>
  );
}
