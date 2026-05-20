'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { safeReadStorage, safeWriteStorage, supportsNotifications } from '../lib/browser';

interface ThemeContextType {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  notifications: boolean;
  setNotifications: (value: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = safeReadStorage('academy-dark-mode');
    return saved === 'true';
  });

  const [notifications, setNotifications] = useState(() => {
    const saved = safeReadStorage('academy-notifications');
    return saved !== 'false'; // Default to true
  });

  useEffect(() => {
    safeWriteStorage('academy-dark-mode', darkMode.toString());
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    safeWriteStorage('academy-notifications', notifications.toString());
    if (!supportsNotifications()) return;

    if (notifications && Notification.permission === 'default') {
      console.info('Notifications are enabled and ready to be requested after user interaction.');
    }
  }, [notifications]);

  return (
    <ThemeContext.Provider value={{ darkMode, setDarkMode, notifications, setNotifications }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
