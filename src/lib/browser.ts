export function isClient() {
  return typeof window !== 'undefined';
}

export function safeReadStorage(key: string) {
  if (!isClient()) return null;

  try {
    return window.localStorage.getItem(key);
  } catch (error) {
    console.warn(`Unable to read localStorage key "${key}"`, error);
    return null;
  }
}

export function safeWriteStorage(key: string, value: string) {
  if (!isClient()) return;

  try {
    window.localStorage.setItem(key, value);
  } catch (error) {
    console.warn(`Unable to write localStorage key "${key}"`, error);
  }
}

export function supportsNotifications() {
  return isClient() && window.isSecureContext && 'Notification' in window;
}

export function isIosLikeBrowser() {
  if (!isClient()) return false;

  const ua = window.navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) || (/Mac/.test(ua) && 'ontouchend' in document);
}

export function isSafariBrowser() {
  if (!isClient()) return false;

  const ua = window.navigator.userAgent;
  return /Safari/i.test(ua) && !/Chrome|CriOS|EdgiOS|FxiOS|OPiOS|Android/i.test(ua);
}

export function isStandaloneApp() {
  if (!isClient()) return false;

  return window.matchMedia?.('(display-mode: standalone)').matches === true || (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
}

export function shouldUseRedirectAuth() {
  // Firebase redirect auth is needed mainly for iOS browsers, where popup flows
  // are more likely to be blocked or lose focus. On Android and desktop, popup
  // auth is more reliable than redirect in storage-partitioned browsers.
  return isIosLikeBrowser();
}

export async function requestNotificationPermission() {
  if (!supportsNotifications()) return 'unsupported' as const;

  try {
    if (Notification.permission === 'granted') return 'granted' as const;
    return await Notification.requestPermission();
  } catch (error) {
    console.warn('Notification permission request failed', error);
    return 'default' as const;
  }
}
