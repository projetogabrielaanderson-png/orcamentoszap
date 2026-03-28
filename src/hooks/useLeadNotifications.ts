import { useEffect, useRef, useCallback } from 'react';
import { useCRM } from '@/contexts/CRMContext';
import { toast } from 'sonner';

function playNotificationSound() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
  } catch {}
}

export function useLeadNotifications() {
  const { leads } = useCRM();
  const prevCountRef = useRef<number | null>(null);
  const initialized = useRef(false);

  const requestPushPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const currentCount = leads.filter(l => l.status === 'new').length;

    if (!initialized.current) {
      prevCountRef.current = currentCount;
      initialized.current = true;
      return;
    }

    if (prevCountRef.current !== null && currentCount > prevCountRef.current) {
      const diff = currentCount - prevCountRef.current;
      
      // Sound
      playNotificationSound();

      // Toast
      toast.info(`🔔 ${diff} novo${diff > 1 ? 's' : ''} lead${diff > 1 ? 's' : ''}!`, {
        description: 'Confira no Kanban ou Dashboard',
        duration: 6000,
      });

      // Browser push
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('LeadFlow — Novo Lead!', {
          body: `${diff} novo${diff > 1 ? 's' : ''} lead${diff > 1 ? 's' : ''} recebido${diff > 1 ? 's' : ''}`,
          icon: '/favicon.ico',
        });
      }
    }

    prevCountRef.current = currentCount;
  }, [leads]);

  return { requestPushPermission };
}
