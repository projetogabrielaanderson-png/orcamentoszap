import { useEffect } from 'react';

/**
 * Toca o som de notificação solicitado pelo Service Worker.
 * O SW envia { type: 'PLAY_NOTIFICATION_SOUND', sound } via postMessage
 * porque a Web Push API não permite tocar áudio direto a partir do SW.
 */
export function playNotificationSound(sound: string) {
  if (!sound || sound === 'none' || sound === 'default') return;
  try {
    const audio = new Audio(`/sounds/${sound}.mp3`);
    audio.volume = 0.7;
    void audio.play().catch(() => {
      /* navegador bloqueou autoplay sem interação */
    });
  } catch {
    /* ignore */
  }
}

export function usePushSoundListener() {
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
    const handler = (event: MessageEvent) => {
      const data = event.data;
      if (data && data.type === 'PLAY_NOTIFICATION_SOUND') {
        playNotificationSound(data.sound);
      }
    };
    navigator.serviceWorker.addEventListener('message', handler);
    return () => navigator.serviceWorker.removeEventListener('message', handler);
  }, []);
}
