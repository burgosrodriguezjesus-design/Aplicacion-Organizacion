import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/store';
import { Card } from '../../components/ui/Card';
import { occursOnDate } from '../../lib/date';

export function HabitsToday({ date }: { date: string }) {
  const allHabits = useStore((s) => s.habits);
  const habitLogs = useStore((s) => s.habitLogs);
  const toggleHabitLog = useStore((s) => s.toggleHabitLog);
  const navigate = useNavigate();

  const todays = useMemo(
    () => allHabits.filter((h) => !h.archived && (occursOnDate(h.createdAt.slice(0, 10), h.recurrence, date) || h.recurrence.freq === 'daily')),
    [allHabits, date],
  );

  if (!todays.length) return null;

  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Hábitos de hoy</h3>
        <button onClick={() => navigate('/mas/habitos')} className="text-xs font-medium text-accent">Ver todos</button>
      </div>
      <div className="space-y-2">
        {todays.map((h) => {
          const log = habitLogs.find((l) => l.habitId === h.id && l.date === date);
          const done = !!log?.done;
          return (
            <button
              key={h.id}
              onClick={() => toggleHabitLog(h.id, date)}
              className="flex w-full items-center gap-3 rounded-xl px-2 py-1.5 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 text-xs transition-colors ${
                  done ? 'border-accent bg-accent text-white' : 'border-zinc-300 dark:border-zinc-600'
                }`}
              >
                {done ? '✓' : ''}
              </span>
              <span className="text-lg leading-none">{h.icon}</span>
              <span className={`flex-1 text-sm ${done ? 'text-zinc-400 line-through' : 'text-zinc-700 dark:text-zinc-200'}`}>{h.name}</span>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
