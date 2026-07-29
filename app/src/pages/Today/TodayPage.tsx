import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useStore, tasksOnDate, taskStatusOnDate } from '../../store/store';
import { useUiStore } from '../../store/uiStore';
import { todayKey } from '../../lib/date';
import { buildTimeline, dayProgressPct, greeting, freeMinutesLeft } from '../../lib/today';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Timeline } from './Timeline';
import { NowNext } from './NowNext';
import { DayInsight } from './DayInsight';
import { HabitsToday } from './HabitsToday';
import { GoalHighlight } from './GoalHighlight';
import { RemindersToday } from './RemindersToday';

function useClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);
  return now;
}

export function TodayPage() {
  const now = useClock();
  const date = todayKey();
  const profile = useStore((s) => s.profile);
  const tasks = useStore((s) => s.tasks);
  const events = useStore((s) => s.events);
  const routines = useStore((s) => s.routines);
  const routineStepStatus = useStore((s) => s.routineStepStatus);
  const dailyOrder = useStore((s) => s.dailyOrder[date]);
  const openQuickAdd = useUiStore((s) => s.openQuickAdd);

  const entries = useMemo(
    () => buildTimeline(date, tasks, events, routines, routineStepStatus, dailyOrder),
    [date, tasks, events, routines, routineStepStatus, dailyOrder],
  );

  const todaysTasks = tasksOnDate(tasks, date);
  const completedCount = todaysTasks.filter((t) => taskStatusOnDate(t, date) === 'completed').length;
  const pendingCount = todaysTasks.filter((t) => taskStatusOnDate(t, date) === 'pending').length;
  const importantCount = todaysTasks.filter((t) => taskStatusOnDate(t, date) === 'pending' && (t.priority === 'urgent' || t.priority === 'important')).length;

  const progress = dayProgressPct(now, profile.usualWake, profile.usualSleep);
  const freeMin = freeMinutesLeft(entries, now, profile.usualSleep);
  const freeHours = Math.round((freeMin / 60) * 10) / 10;

  return (
    <div className="mx-auto max-w-3xl px-4 pt-6 sm:px-6 md:pt-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
          {greeting(now)}, {profile.name} {profile.avatarEmoji}
        </h1>
        <p className="mt-1 text-sm capitalize text-zinc-400">
          {format(now, "EEEE, d 'de' MMMM", { locale: es })} · {format(now, 'HH:mm')}
        </p>
      </div>

      <div className="mb-5 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-zinc-500">Tu día</span>
          <span className="font-semibold text-zinc-900 dark:text-zinc-50">{progress}%</span>
        </div>
        <ProgressBar value={progress} />
        <div className="mt-3 grid grid-cols-4 gap-2 text-center">
          <Stat value={importantCount} label="Importantes" emphasise />
          <Stat value={pendingCount} label="Pendientes" />
          <Stat value={completedCount} label="Hechas" />
          <Stat value={freeHours} label="h libres" />
        </div>
      </div>

      <div className="mb-5">
        <NowNext entries={entries} />
      </div>

      <div className="mb-6">
        <DayInsight date={date} freeMinutes={freeMin} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Tu día</h2>
            <button onClick={() => openQuickAdd('menu')} className="text-xs font-medium text-accent">+ Añadir</button>
          </div>
          <Timeline date={date} />
        </div>

        <div className="space-y-4">
          <HabitsToday date={date} />
          <GoalHighlight />
          <RemindersToday date={date} />
        </div>
      </div>
    </div>
  );
}

function Stat({ value, label, emphasise }: { value: number; label: string; emphasise?: boolean }) {
  return (
    <div>
      <p className={`text-lg font-bold ${emphasise ? 'text-accent' : 'text-zinc-900 dark:text-zinc-50'}`}>{value}</p>
      <p className="text-[10px] uppercase tracking-wide text-zinc-400">{label}</p>
    </div>
  );
}
