import './globals.css';
import type { Metadata } from 'next';
import { Inter, Raleway, Montserrat } from 'next/font/google';
import { ClientProviders } from '@/components/ClientProviders';
import PageTransitionLoader from '@/components/ui/PageTransitionLoader';
import SmoothTransition from '@/components/ui/SmoothTransition';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const raleway = Raleway({ subsets: ['latin'], variable: '--font-raleway' });
const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-montserrat' });

export const metadata: Metadata = {
  title: 'DV BERRY - Стильные очки и модная одежда',
  description: 'Эксклюзивные солнцезащитные очки из Китая и качественная одежда из Европы. Оригинальность, стиль и качество.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className={`${inter.variable} ${raleway.variable} ${montserrat.variable} font-sans`}>
        <svg width="0" height="0" style={{ position: 'absolute' }}>
          <linearGradient id="orange-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D35400" />
            <stop offset="100%" stopColor="#D35400" />
          </linearGradient>
          <linearGradient id="custard-peach-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EED970" />
            <stop offset="100%" stopColor="#FFBE7C" />
          </linearGradient>
        </svg>
        <ClientProviders>
          {children}
          <PageTransitionLoader />
        </ClientProviders>
      </body>
    </html>
  );
}
