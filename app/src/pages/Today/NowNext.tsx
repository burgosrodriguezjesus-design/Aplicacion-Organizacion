import { useMemo } from 'react';
import type { TimelineEntry } from '../../types';
import { Card } from '../../components/ui/Card';
import { toMinutes, minutesToTime } from '../../lib/date';

function useNowMinutes() {
  return new Date().getHours() * 60 + new Date().getMinutes();
}

export function NowNext({ entries }: { entries: TimelineEntry[] }) {
  const nowMin = useNowMinutes();

  const { current, next } = useMemo(() => {
    const timed = entries.filter((e) => e.time && e.status !== 'completed' && e.status !== 'skipped');
    let current: TimelineEntry | undefined;
    let next: TimelineEntry | undefined;
    for (const e of timed) {
      const start = toMinutes(e.time);
      const end = start + (e.duration || 30);
      if (nowMin >= start && nowMin < end) current = e;
      if (start > nowMin && (!next || start < toMinutes(next.time))) next = e;
    }
    return { current, next };
  }, [entries, nowMin]);

  if (!current && !next) return null;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {current && (
        <Card className="border-accent/30 bg-accent/5 p-4">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-accent">Ahora</p>
          <p className="text-base font-semibold text-zinc-900 dark:text-zinc-50">{current.icon ? `${current.icon} ` : ''}{current.title}</p>
          <p className="mt-0.5 text-xs text-zinc-500">
            Faltan {Math.max(0, toMinutes(current.time) + (current.duration || 30) - nowMin)} minutos para terminar
          </p>
        </Card>
      )}
      {next && (
        <Card className="p-4">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">Próximo</p>
          <p className="text-base font-semibold text-zinc-900 dark:text-zinc-50">{next.icon ? `${next.icon} ` : ''}{next.title}</p>
          <p className="mt-0.5 text-xs text-zinc-500">{minutesToTime(toMinutes(next.time))} · en {Math.max(0, toMinutes(next.time) - nowMin)} min</p>
        </Card>
      )}
    </div>
  );
}
