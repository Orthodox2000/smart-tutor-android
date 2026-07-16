import type { Metadata, Viewport } from 'next';
import '../index.css';
import { Providers } from './providers';
import StartupPermissionsPrompt from '../components/StartupPermissionsPrompt';

export const metadata: Metadata = {
  title: 'Smart Tutors',
  description: 'Smart Tutors - Educational platform for excellence.',
  manifest: '/site.webmanifest',
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
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <Providers>
          <StartupPermissionsPrompt />
          {children}
        </Providers>
      </body>
    </html>
  );
}
