import type {Metadata, Viewport} from 'next';
import {Plus_Jakarta_Sans, Public_Sans, JetBrains_Mono} from 'next/font/google';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
});

const publicSans = Public_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
});

export const viewport: Viewport = {
  themeColor: '#060B19',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'Falylio Yara — Dream • Create • Grow | All-in-One Digital Platform',
  description:
    'Professional All-in-One Digital Platform uniting AI tools, online utilities, education, digital marketplace, software directory, stock media, and productivity services.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'FalylioYara',
  },
  icons: {
    icon: [
      {url: '/icon.svg', type: 'image/svg+xml'},
      {url: '/pwa-192x192.png', sizes: '192x192', type: 'image/png'},
      {url: '/pwa-512x512.png', sizes: '512x512', type: 'image/png'},
    ],
    apple: [{url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png'}],
  },
  openGraph: {
    title: 'Falylio Yara — Dream • Create • Grow | All-in-One Digital Platform',
    description:
      'Professional All-in-One Digital Platform uniting AI tools, online utilities, education, digital marketplace, software directory, stock media, and productivity services.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Falylio Yara — Dream • Create • Grow | All-in-One Digital Platform',
    description:
      'Professional All-in-One Digital Platform uniting AI tools, online utilities, education, digital marketplace, software directory, stock media, and productivity services.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${publicSans.variable} ${jetbrainsMono.variable} scroll-smooth`}
    >
      <body
        suppressHydrationWarning
        className="min-h-screen bg-[#060B19] text-slate-100 antialiased selection:bg-[#00D2FF]/25 selection:text-white"
        style={{fontFamily: 'var(--font-sans), sans-serif'}}
      >
        {children}
      </body>
    </html>
  );
}
