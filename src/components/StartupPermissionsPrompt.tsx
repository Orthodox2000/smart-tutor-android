'use client';

import React from 'react';
import { Bell, X } from 'lucide-react';
import {
  isIosLikeBrowser,
  isSafariBrowser,
  requestNotificationPermission,
  safeReadStorage,
  safeWriteStorage,
  supportsNotifications,
} from '../lib/browser';

const DISMISS_KEY = 'startup-permissions-dismissed';

export default function StartupPermissionsPrompt() {
  const [visible, setVisible] = React.useState(false);
  const [requesting, setRequesting] = React.useState(false);
  const [permissionState, setPermissionState] = React.useState<'default' | 'denied' | 'granted' | 'unsupported'>('unsupported');

  React.useEffect(() => {
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

  const requestAccess = async () => {
    setRequesting(true);
    const result = await requestNotificationPermission();
    setPermissionState(result);
    setRequesting(false);

    if (result === 'granted' || result === 'unsupported') {
      dismiss();
    }
  };

  if (!visible) return null;

  const iosSafari = isIosLikeBrowser() && isSafariBrowser();
  const title = iosSafari
    ? 'Safari needs a manual permissions step'
    : 'Enable notifications on startup';
  const description = iosSafari
    ? 'iPhone Safari does not allow us to force notification approval automatically. Open Share > Add to Home Screen, then allow notifications when Safari asks.'
    : 'Tap once so the app can request browser permissions in a supported way during startup.';

  return (
    <div className="fixed inset-x-4 top-4 z-[100] max-w-[430px] mx-auto">
      <div className="rounded-3xl border border-academy-orange-100 bg-white/95 backdrop-blur-xl shadow-2xl p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-academy-orange-50 text-academy-orange-600">
            <Bell size={18} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-slate-900">{title}</p>
            <p className="mt-1 text-xs leading-5 text-slate-600">{description}</p>

            {permissionState === 'denied' && (
              <p className="mt-2 text-xs font-medium text-red-600">
                Notifications are blocked. Re-enable them from Safari or browser site settings.
              </p>
            )}

            <div className="mt-3 flex gap-2">
              {supportsNotifications() && permissionState !== 'granted' && (
                <button
                  onClick={requestAccess}
                  disabled={requesting}
                  className="rounded-2xl bg-academy-orange-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-academy-orange-700 disabled:opacity-60"
                >
                  {requesting ? 'Requesting...' : 'Allow now'}
                </button>
              )}
              <button
                onClick={dismiss}
                className="rounded-2xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-200"
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
  );
}
