'use client';

import React, { useEffect, useState } from 'react';
import { useNetwork } from '../contexts/NetworkContext';
import { WifiOff, RefreshCw, Wifi } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function NetworkBanner() {
  const { state } = useNetwork();
  const [showBackOnline, setShowBackOnline] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (state === 'offline') {
      setWasOffline(true);
    }
    if (state === 'online' && wasOffline) {
      setShowBackOnline(true);
      setWasOffline(false);
      const timer = setTimeout(() => setShowBackOnline(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [state, wasOffline]);

  return (
    <>
      <AnimatePresence>
        {state === 'offline' && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 left-0 right-0 z-[9999] bg-red-500 text-white px-4 py-3 flex items-center justify-center gap-3 shadow-lg"
          >
            <WifiOff size={18} />
            <span className="text-sm font-semibold">No internet connection</span>
            <span className="text-xs opacity-80">Check your network and try again</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {state === 'reconnecting' && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 left-0 right-0 z-[9999] bg-amber-500 text-white px-4 py-3 flex items-center justify-center gap-3 shadow-lg"
          >
            <RefreshCw size={18} className="animate-spin" />
            <span className="text-sm font-semibold">Reconnecting...</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showBackOnline && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 left-0 right-0 z-[9999] bg-emerald-500 text-white px-4 py-3 flex items-center justify-center gap-3 shadow-lg"
          >
            <Wifi size={18} />
            <span className="text-sm font-semibold">You&apos;re back online</span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
