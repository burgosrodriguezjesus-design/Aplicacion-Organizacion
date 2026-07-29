import { useMemo } from 'react';
import { useStore, tasksOnDate, eventsOnDate } from '../../store/store';
import { monthGrid } from './calendarUtils';
import { todayKey, WEEKDAY_LABELS_SHORT } from '../../lib/date';

export function MonthView({ anchor, onSelectDay }: { anchor: Date; onSelectDay: (date: string) => void }) {
  const tasks = useStore((s) => s.tasks);
  const events = useStore((s) => s.events);
  const weekStartsOn = useStore((s) => s.profile.weekStartsOn);
  const today = todayKey();

  const days = useMemo(() => monthGrid(anchor, weekStartsOn), [anchor, weekStartsOn]);
  const currentMonth = anchor.getMonth();

  const orderedLabels = weekStartsOn === 1 ? [...WEEKDAY_LABELS_SHORT.slice(1), WEEKDAY_LABELS_SHORT[0]] : WEEKDAY_LABELS_SHORT;

  return (
    <div>
      <div className="mb-1 grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-zinc-400">
        {orderedLabels.map((l, i) => <div key={i}>{l}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((d) => {
          const inMonth = new Date(d + 'T00:00:00').getMonth() === currentMonth;
          const isToday = d === today;
          const t = tasksOnDate(tasks, d).length;
          const e = eventsOnDate(events, d).length;
          const total = t + e;
          return (
            <button
              key={d}
              onClick={() => onSelectDay(d)}
              className={`flex aspect-square flex-col items-center justify-start gap-1 rounded-xl p-1.5 pt-2 text-sm transition-colors ${
                inMonth ? 'text-zinc-700 dark:text-zinc-200' : 'text-zinc-300 dark:text-zinc-700'
              } ${isToday ? 'bg-accent/10 font-bold text-accent' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/60'}`}
            >
              <span>{Number(d.slice(8, 10))}</span>
              {total > 0 && (
                <span className="flex gap-0.5">
                  {Array.from({ length: Math.min(total, 3) }).map((_, i) => (
                    <span key={i} className="h-1 w-1 rounded-full bg-accent" />
                  ))}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
