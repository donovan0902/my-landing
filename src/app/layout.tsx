import type { Metadata } from 'next';
import { Average, Open_Sans } from 'next/font/google';
import '../index.css';

const average = Average({ subsets: ['latin'], weight: '400', variable: '--font-average' });
const openSans = Open_Sans({ subsets: ['latin'], style: ['normal', 'italic'], variable: '--font-open-sans' });

export const metadata: Metadata = {
  title: 'Donovan Liao',
  icons: { icon: '/favicon.svg?v=2' },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${average.variable} ${openSans.variable}`}>
      <body>
        <div id="root">{children}</div>
      </body>
    </html>
  );
}
