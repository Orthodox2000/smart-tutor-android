'use client';

import React from 'react';
import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { NetworkProvider } from '../contexts/NetworkContext';
import NetworkBanner from '../components/NetworkBanner';
import '../lib/i18n';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NetworkProvider>
      <AuthProvider>
        <ThemeProvider>
          <NetworkBanner />
          {children}
        </ThemeProvider>
      </AuthProvider>
    </NetworkProvider>
  );
}
