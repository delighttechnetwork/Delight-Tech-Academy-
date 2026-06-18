import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import { AppProvider } from '@/lib/AppContext';
import './globals.css';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Delight Tech Network Academy — Learn. Build. Launch.',
  description: 'Nigeria\'s Premier Tech Academy in Ibadan, Oyo State — Lighting Through Technology. Hands-on practical graphics design, full-stack web development, prompt engineering, cyber security, and video animation coaching.',
  icons: {
    icon: '/api/favicon',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={poppins.variable}>
      <body className="font-sans antialiased text-white bg-[#0A1228]" suppressHydrationWarning>
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
