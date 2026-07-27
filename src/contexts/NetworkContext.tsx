'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';

type NetworkState = 'online' | 'offline' | 'reconnecting';

interface NetworkContextType {
  state: NetworkState;
  isOnline: boolean;
  isOffline: boolean;
  isReconnecting: boolean;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export const NetworkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<NetworkState>(
    typeof navigator !== 'undefined' && navigator.onLine ? 'online' : 'offline'
  );
  const reconnectTimer = useRef<NodeJS.Timeout | null>(null);
  const checkCount = useRef(0);

  const checkConnectivity = useCallback(async () => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      await fetch('/api/auth/session', {
        method: 'HEAD',
        signal: controller.signal,
        cache: 'no-store',
      });
      clearTimeout(timeout);
      return true;
    } catch {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        await fetch('https://www.google.com', {
          method: 'HEAD',
          mode: 'no-cors',
          signal: controller.signal,
          cache: 'no-store',
        });
        clearTimeout(timeout);
        return true;
      } catch {
        return false;
      }
    }
  }, []);

  useEffect(() => {
    const handleOnline = async () => {
      setState('reconnecting');
      const ok = await checkConnectivity();
      if (ok) {
        setState('online');
        checkCount.current = 0;
      } else {
        setState('offline');
      }
    };

    const handleOffline = () => {
      setState('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const interval = setInterval(async () => {
      if (!navigator.onLine) return;
      const ok = await checkConnectivity();
      if (!ok && state === 'online') {
        setState('offline');
      } else if (ok && state === 'offline') {
        setState('reconnecting');
        const recheck = await checkConnectivity();
        if (recheck) {
          setState('online');
          checkCount.current = 0;
        }
      }
    }, 15000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    };
  }, [checkConnectivity, state]);

  return (
    <NetworkContext.Provider value={{
      state,
      isOnline: state === 'online',
      isOffline: state === 'offline',
      isReconnecting: state === 'reconnecting',
    }}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
};
