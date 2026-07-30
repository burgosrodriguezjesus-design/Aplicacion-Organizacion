import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useSharedEventsStore } from '../store/sharedEventsStore';

/**
 * Keeps the shared (couple) events realtime subscription in sync with the
 * current couple. Renders nothing — just an effect, mounted once in AppShell.
 */
export function SharedDataSync() {
  const coupleId = useAuthStore((s) => s.couple?.id);
  const subscribe = useSharedEventsStore((s) => s.subscribe);
  const unsubscribe = useSharedEventsStore((s) => s.unsubscribe);

  useEffect(() => {
    if (coupleId) subscribe(coupleId);
    else unsubscribe();
    return () => unsubscribe();
  }, [coupleId, subscribe, unsubscribe]);

  return null;
}
