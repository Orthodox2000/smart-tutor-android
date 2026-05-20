import { requestNotificationPermission, safeReadStorage, supportsNotifications } from './browser';

export function sendAcademyNotification(title: string, body: string, iconUrl?: string) {
  if (!supportsNotifications()) return;

  const notificationsEnabled = safeReadStorage('academy-notifications') !== 'false';
  
  if (!notificationsEnabled) return;

  if (Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: iconUrl || 'https://api.dicebear.com/7.x/initials/svg?seed=ST&backgroundColor=EA580C',
      tag: 'academy-alert'
    });
  } else if (Notification.permission !== 'denied') {
    requestNotificationPermission().then(permission => {
      if (permission === 'granted') {
        new Notification(title, { body, icon: iconUrl });
      }
    });
  }
}
