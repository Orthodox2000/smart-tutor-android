import type { Metadata, Viewport } from 'next';
import '../index.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Smart Tutors',
  description: 'Smart Tutors - Educational platform for excellence.',
  manifest: '/site.webmanifest',
  openGraph: {
    title: 'Smart Tutors',
    description: 'Smart Tutors - Educational platform for excellence.',
    images: [
      {
        url: 'https://smarttutors.co.in/image4.jpeg',
        width: 1200,
        height: 630,
        alt: 'Smart Tutors',
      },
    ],
    type: 'website',
    siteName: 'Smart Tutors',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Smart Tutors',
    description: 'Smart Tutors - Educational platform for excellence.',
    images: ['https://smarttutors.co.in/image4.jpeg'],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning style={{ height: '100%', overflow: 'hidden' }}>
      <body className="font-sans antialiased" suppressHydrationWarning style={{ height: '100%', overflow: 'hidden', position: 'fixed', width: '100%', top: 0, left: 0, margin: 0, padding: 0 }}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
