'use client';

import React from 'react';
import { Bell, MapPin, X } from 'lucide-react';
import {
  isIosLikeBrowser,
  isSafariBrowser,
  requestNotificationPermission,
  safeReadStorage,
  safeWriteStorage,
  supportsNotifications,
} from '../lib/browser';
import { isCapacitor, registerForPushNotifications, requestLocationPermission } from '../lib/capacitor';

const DISMISS_KEY = 'startup-permissions-dismissed';
const LOCATION_KEY = 'startup-location-dismissed';

export default function StartupPermissionsPrompt() {
  const [visible, setVisible] = React.useState(false);
  const [locationVisible, setLocationVisible] = React.useState(false);
  const [requesting, setRequesting] = React.useState(false);
  const [permissionState, setPermissionState] = React.useState<'default' | 'denied' | 'granted' | 'unsupported'>('unsupported');

  React.useEffect(() => {
    if (isCapacitor()) {
      registerForPushNotifications();
      setTimeout(() => {
        const locDismissed = safeReadStorage(LOCATION_KEY) === 'true';
        if (!locDismissed) setLocationVisible(true);
      }, 1500);
      return;
    }

    const dismissed = safeReadStorage(DISMISS_KEY) === 'true';
    if (dismissed) return;

    if (supportsNotifications()) {
      setPermissionState(Notification.permission);
      if (Notification.permission !== 'granted') {
        setVisible(true);
      }
      return;
    }

    if (isIosLikeBrowser() || isSafariBrowser()) {
      setPermissionState('unsupported');
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    safeWriteStorage(DISMISS_KEY, 'true');
    setVisible(false);
  };

  const dismissLocation = () => {
    safeWriteStorage(LOCATION_KEY, 'true');
    setLocationVisible(false);
  };

  const requestAccess = async () => {
    setRequesting(true);
    const result = await requestNotificationPermission();
    setPermissionState(result);
    setRequesting(false);

    if (result === 'granted' || result === 'unsupported') {
      dismiss();
    }
  };

  const requestLocation = async () => {
    setRequesting(true);
    await requestLocationPermission();
    setRequesting(false);
    dismissLocation();
  };

  return (
    <>
      {visible && (
        <div className="fixed inset-x-4 top-4 z-[100] max-w-[430px] mx-auto" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
          <div className="rounded-3xl border border-orange-100 bg-white/95 backdrop-blur-xl shadow-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                <Bell size={18} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-900">Enable Notifications</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Stay updated with session reminders, messages, and attendance alerts.
                </p>

                {permissionState === 'denied' && (
                  <p className="mt-2 text-xs font-medium text-red-500">
                    Notifications are blocked. Re-enable them from browser site settings.
                  </p>
                )}

                <div className="mt-3 flex gap-2">
                  {supportsNotifications() && permissionState !== 'granted' && (
                    <button
                      onClick={requestAccess}
                      disabled={requesting}
                      className="rounded-2xl bg-orange-500 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-orange-600 disabled:opacity-60"
                    >
                      {requesting ? 'Requesting...' : 'Allow now'}
                    </button>
                  )}
                  <button
                    onClick={dismiss}
                    className="rounded-2xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-200"
                  >
                    Continue
                  </button>
                </div>
              </div>
              <button onClick={dismiss} className="text-slate-300 transition-colors hover:text-slate-500">
                <X size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {locationVisible && (
        <div className="fixed inset-x-4 top-4 z-[100] max-w-[430px] mx-auto" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
          <div className="rounded-3xl border border-blue-100 bg-white/95 backdrop-blur-xl shadow-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-500">
                <MapPin size={18} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-900">Allow Location Access</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Location helps with campus check-ins, nearby sessions, and attendance verification.
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={requestLocation}
                    disabled={requesting}
                    className="rounded-2xl bg-blue-500 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-blue-600 disabled:opacity-60"
                  >
                    {requesting ? 'Requesting...' : 'Allow Location'}
                  </button>
                  <button
                    onClick={dismissLocation}
                    className="rounded-2xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-200"
                  >
                    Skip
                  </button>
                </div>
              </div>
              <button onClick={dismissLocation} className="text-slate-300 transition-colors hover:text-slate-500">
                <X size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
