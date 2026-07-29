import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip, CartesianGrid } from 'recharts';
import { useStore } from '../../store/store';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { taskCompletionSummary, habitsCompletionSummary, hoursByCategory, last7DaysProductivity } from '../../lib/stats';
import { computeHabitStats } from '../../lib/habitStats';
import { todayKey } from '../../lib/date';

export function StatsPage() {
  const tasks = useStore((s) => s.tasks);
  const events = useStore((s) => s.events);
  const habits = useStore((s) => s.habits);
  const habitLogs = useStore((s) => s.habitLogs);
  const categories = useStore((s) => s.categories);
  const today = todayKey();

  const taskSummary = taskCompletionSummary(tasks, today);
  const habitSummary = habitsCompletionSummary(habits, habitLogs, today);
  const categoryHours = hoursByCategory(tasks, events, categories);
  const productivity = last7DaysProductivity(tasks);
  const bestStreaks = habits.map((h) => computeHabitStats(h, habitLogs).currentStreak).sort((a, b) => b - a);

  return (
    <div className="mx-auto max-w-3xl px-4 pt-6 sm:px-6 md:pt-10">
      <PageHeader title="Estadísticas" back subtitle="Tu progreso, sin complicaciones" />

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MiniStat value={taskSummary.completed} label="Tareas hechas" />
        <MiniStat value={taskSummary.pending} label="Pendientes" />
        <MiniStat value={`${taskSummary.rate}%`} label="Cumplimiento" />
        <MiniStat value={`${habitSummary.completed}/${habitSummary.total}`} label="Hábitos hoy" />
      </div>

      <Card className="mb-4 p-4">
        <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">Tareas completadas — últimos 7 días</h3>
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={productivity}>
              <CartesianGrid vertical={false} stroke="currentColor" className="text-zinc-100 dark:text-zinc-800" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} className="text-xs" tick={{ fill: '#a1a1aa' }} />
              <Tooltip
                cursor={{ fill: 'rgba(99,102,241,0.08)' }}
                contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 12 }}
              />
              <Bar dataKey="completed" fill="var(--accent)" radius={[6, 6, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {categoryHours.length > 0 && (
        <Card className="mb-4 p-4">
          <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">Horas por categoría (30 días)</h3>
          <div className="space-y-2.5">
            {categoryHours.map((c) => (
              <div key={c.name}>
                <div className="mb-1 flex justify-between text-xs text-zinc-500">
                  <span>{c.name}</span>
                  <span className="font-medium">{c.hours} h</span>
                </div>
                <ProgressBar value={(c.hours / categoryHours[0].hours) * 100} barClassName="bg-accent" />
              </div>
            ))}
          </div>
        </Card>
      )}

      {habits.length > 0 && (
        <Card className="p-4">
          <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">Rachas de hábitos</h3>
          <div className="flex flex-wrap gap-2">
            {habits.map((h) => {
              const s = computeHabitStats(h, habitLogs);
              return (
                <div key={h.id} className="flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                  <span>{h.icon}</span> {h.name} · 🔥 {s.currentStreak}
                </div>
              );
            })}
          </div>
          {bestStreaks[0] > 0 && <p className="mt-3 text-xs text-zinc-400">Tu mejor racha activa ahora mismo: {bestStreaks[0]} días.</p>}
        </Card>
      )}
    </div>
  );
}

function MiniStat({ value, label }: { value: string | number; label: string }) {
  return (
    <Card className="p-3 text-center">
      <p className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{value}</p>
      <p className="text-[10px] uppercase tracking-wide text-zinc-400">{label}</p>
    </Card>
  );
}
