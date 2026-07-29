import { useMemo } from 'react';
import { Plus, Repeat, Flame } from 'lucide-react';
import { useStore } from '../../store/store';
import { useUiStore } from '../../store/uiStore';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { computeHabitStats, last35Days } from '../../lib/habitStats';
import { todayKey } from '../../lib/date';

export function HabitsPage() {
  const allHabits = useStore((s) => s.habits);
  const habits = useMemo(() => allHabits.filter((h) => !h.archived), [allHabits]);
  const habitLogs = useStore((s) => s.habitLogs);
  const toggleHabitLog = useStore((s) => s.toggleHabitLog);
  const setEditingHabitId = useUiStore((s) => s.setEditingHabitId);
  const today = todayKey();
  const days = last35Days();

  return (
    <div className="mx-auto max-w-3xl px-4 pt-6 sm:px-6 md:pt-10">
      <PageHeader
        title="Hábitos"
        back
        subtitle="Constancia día a día"
        action={<Button variant="primary" size="sm" onClick={() => setEditingHabitId('new')}><Plus size={16} /> Nuevo</Button>}
      />

      {habits.length === 0 ? (
        <EmptyState icon={<Repeat className="text-zinc-300" />} title="Sin hábitos todavía" subtitle="Añade hábitos como beber agua, entrenar o leer para hacerles seguimiento." />
      ) : (
        <div className="space-y-3">
          {habits.map((h) => {
            const stats = computeHabitStats(h, habitLogs);
            const doneToday = habitLogs.some((l) => l.habitId === h.id && l.date === today && l.done);
            return (
              <Card key={h.id} className="p-4">
                <div className="mb-3 flex items-center gap-3">
                  <button
                    onClick={() => toggleHabitLog(h.id, today)}
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl transition-colors ${doneToday ? 'bg-accent text-white' : 'bg-zinc-100 dark:bg-zinc-800'}`}
                  >
                    {h.icon}
                  </button>
                  <button onClick={() => setEditingHabitId(h.id)} className="min-w-0 flex-1 text-left">
                    <p className="font-semibold text-zinc-900 dark:text-zinc-50">{h.name}</p>
                    <p className="flex items-center gap-1 text-xs text-zinc-400">
                      <Flame size={12} className="text-orange-400" /> {stats.currentStreak} días seguidos · récord {stats.bestStreak} · {stats.completionRate}% cumplimiento
                    </p>
                  </button>
                </div>
                <div className="grid grid-cols-[repeat(35,minmax(0,1fr))] gap-[3px]">
                  {days.map((d) => {
                    const done = habitLogs.some((l) => l.habitId === h.id && l.date === d && l.done);
                    return (
                      <div
                        key={d}
                        title={d}
                        className={`aspect-square rounded-[2px] ${done ? 'bg-accent' : 'bg-zinc-100 dark:bg-zinc-800'}`}
                      />
                    );
                  })}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
