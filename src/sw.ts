/// <reference lib="webworker" />
import { precacheAndRoute } from 'workbox-precaching';

declare const self: ServiceWorkerGlobalScope;

precacheAndRoute(self.__WB_MANIFEST || []);

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event: PushEvent) => {
  let data: any = {};
  try {
    data = event.data?.json() ?? {};
  } catch {
    data = { title: 'CRM ZAP', body: event.data?.text() ?? '' };
  }
  const title = data.title || 'CRM ZAP';
  const sound: string = data.sound || 'default';
  const vibrateOn: boolean = data.vibrate !== false;

  const options: NotificationOptions = {
    body: data.body || '',
    icon: data.icon || '/pwa-192x192.png',
    badge: data.badge || '/pwa-192x192.png',
    data: data.data || { url: '/kanban', sound },
    tag: 'crmzap-lead',
    requireInteraction: true,
    ...(vibrateOn ? { vibrate: [200, 100, 200] } : {}),
    ...({ renotify: true } as any),
  } as NotificationOptions;

  event.waitUntil(
    (async () => {
      await self.registration.showNotification(title, options);
      // Avisa clients ativos para tocar áudio (SW não pode tocar som direto)
      if (sound && sound !== 'none' && sound !== 'default') {
        const clientsArr = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
        for (const c of clientsArr) {
          c.postMessage({ type: 'PLAY_NOTIFICATION_SOUND', sound });
        }
      }
    })()
  );
});

self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/kanban';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientsArr) => {
      for (const client of clientsArr) {
        if ('focus' in client) {
          (client as WindowClient).navigate(url);
          return (client as WindowClient).focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});
