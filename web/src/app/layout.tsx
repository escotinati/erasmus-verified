import type { Metadata, Viewport } from 'next';
import { Archivo_Black, Inter, Plus_Jakarta_Sans } from 'next/font/google';
import { BottomNav } from '@/components/BottomNav';
import { getExperience } from '@/lib/get-experience';
import './globals.css';

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], weight: ['600', '700', '800'], variable: '--font-jakarta', display: 'swap' });
const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-inter', display: 'swap' });
const archivo = Archivo_Black({ subsets: ['latin'], weight: '400', variable: '--font-archivo', display: 'swap' });

export const metadata: Metadata = {
  title: { default: 'Erasmus Parties', template: '%s · Erasmus Parties' },
  description: 'Entradas para las mejores noches Erasmus.',
};

export const viewport: Viewport = { themeColor: '#0A0A0F', width: 'device-width', initialScale: 1 };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const experience = await getExperience();
  return (
    <html lang="es" data-experience={experience} className={`${jakarta.variable} ${inter.variable} ${archivo.variable}`}>
      <body>
        {children}
        <BottomNav />
      </body>
    </html>
  );
}
