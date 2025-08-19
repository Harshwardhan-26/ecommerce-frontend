import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ShopEase - Your Ultimate Shopping Destination',
  description: 'Discover amazing products at unbeatable prices. Shop electronics, clothing, books, and more with fast delivery and secure payments.',
  keywords: 'ecommerce, shopping, electronics, clothing, books, online store, deals, discounts',
  authors: [{ name: 'Harshwardhan Goyal' }],
  creator: 'Harshwardhan Goyal',
  publisher: 'ShopEase',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://shopease.vercel.app',
    siteName: 'ShopEase',
    title: 'ShopEase - Your Ultimate Shopping Destination',
    description: 'Discover amazing products at unbeatable prices. Shop electronics, clothing, books, and more with fast delivery and secure payments.',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'ShopEase - Online Shopping',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ShopEase - Your Ultimate Shopping Destination',
    description: 'Discover amazing products at unbeatable prices. Shop electronics, clothing, books, and more with fast delivery and secure payments.',
    images: ['/images/og-image.jpg'],
    creator: '@harshwardhan_bb',
  },
  viewport: 'width=device-width, initial-scale=1',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'mask-icon', url: '/safari-pinned-tab.svg', color: '#3b82f6' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </head>
      <body className={`${inter.variable} ${poppins.variable} font-sans antialiased`}>
        <Providers>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}