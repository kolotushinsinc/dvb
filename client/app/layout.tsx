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
        <ClientProviders>
          <SmoothTransition>
            {children}
          </SmoothTransition>
          <PageTransitionLoader />
        </ClientProviders>
      </body>
    </html>
  );
}