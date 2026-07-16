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

  try {
    const { PushNotifications } = await import('@capacitor/push-notifications');
    const result = await PushNotifications.requestPermissions();
    return result.receive === 'granted' ? 'granted' : 'denied';
  } catch (error) {
    console.warn('Native notification permission request failed:', error);
    return 'denied';
  }
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
    console.warn('Native location permission request failed:', error);
    return 'denied';
  }
}

export async function registerForPushNotifications(): Promise<void> {
  if (!isCapacitor()) return;

  try {
    const { PushNotifications } = await import('@capacitor/push-notifications');
    
    const permResult = await PushNotifications.requestPermissions();
    if (permResult.receive !== 'granted') return;

    await PushNotifications.register();

    PushNotifications.addListener('registration', (token) => {
      console.info('Push registration success:', token.value);
    });

    PushNotifications.addListener('registrationError', (error) => {
      console.error('Push registration error:', error);
    });

    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.info('Push received:', notification);
    });

    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      console.info('Push action performed:', action);
    });
  } catch (error) {
    console.warn('Push notification setup failed:', error);
  }
}
