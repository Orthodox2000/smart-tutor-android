import { Capacitor } from '@capacitor/core';

export function isCapacitor(): boolean {
  return Capacitor.isNativePlatform();
}

export function isAndroid(): boolean {
  return Capacitor.getPlatform() === 'android';
}

export function isIOS(): boolean {
  return Capacitor.getPlatform() === 'ios';
}

export async function requestNativeNotificationPermission(): Promise<string> {
  if (!isCapacitor()) {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.requestPermission();
    }
    return 'unsupported';
  }
  return 'unsupported';
}

export async function requestLocationPermission(): Promise<string> {
  if (!isCapacitor()) {
    try {
      if (typeof navigator !== 'undefined' && navigator.geolocation) {
        return new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            () => resolve('granted'),
            () => resolve('denied'),
            { timeout: 5000 }
          );
        });
      }
      return 'unsupported';
    } catch {
      return 'denied';
    }
  }

  try {
    const { Geolocation } = await import('@capacitor/geolocation');
    const result = await Geolocation.requestPermissions();
    return result.location === 'granted' ? 'granted' : 'denied';
  } catch (error) {
    return 'denied';
  }
}
