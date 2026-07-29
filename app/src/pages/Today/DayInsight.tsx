import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { addDays } from 'date-fns';
import { AlertTriangle, Sparkles } from 'lucide-react';
import { useStore, tasksOnDate, taskStatusOnDate } from '../../store/store';
import { Button } from '../../components/ui/Button';
import { dateKey } from '../../lib/date';

export function DayInsight({ date, freeMinutes }: { date: string; freeMinutes: number }) {
  const tasks = useStore((s) => s.tasks);
  const updateTask = useStore((s) => s.updateTask);
  const navigate = useNavigate();

  const pending = useMemo(
    () => tasksOnDate(tasks, date).filter((t) => taskStatusOnDate(t, date) === 'pending'),
    [tasks, date],
  );
  const workloadMinutes = pending.reduce((sum, t) => sum + (t.duration || 30), 0);
  const freeHours = Math.round((freeMinutes / 60) * 10) / 10;

  const isOverloaded = pending.length >= 4 && workloadMinutes > freeMinutes && freeMinutes >= 0;

  const moveLowPriorityToTomorrow = () => {
    const tomorrow = dateKey(addDays(new Date(date + 'T00:00:00'), 1));
    pending
      .filter((t) => t.priority === 'low')
      .forEach((t) => updateTask(t.id, { date: t.recurrence.freq === 'none' ? tomorrow : t.date }));
  };

  if (!pending.length) {
    return (
      <div className="flex items-center gap-2.5 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
        <Sparkles size={16} className="shrink-0" />
        No tienes tareas pendientes para hoy. ¡Buen ritmo!
      </div>
    );
  }

  if (isOverloaded) {
    return (
      <div className="rounded-2xl bg-amber-50 px-4 py-3.5 text-sm text-amber-800 dark:bg-amber-950/30 dark:text-amber-400">
        <div className="mb-2 flex items-start gap-2.5">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <p>
            Tienes <strong>{pending.length} tareas pendientes</strong> y aproximadamente <strong>{freeHours} h</strong> libres hoy. Tu día está bastante lleno.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 pl-6">
          <Button size="sm" variant="primary" onClick={() => navigate('/calendario?plan=1')}>Organizar mi día</Button>
          <Button size="sm" variant="secondary" onClick={moveLowPriorityToTomorrow}>Mover tareas de baja prioridad a mañana</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2.5 rounded-2xl bg-accent/10 px-4 py-3 text-sm text-accent">
      <Sparkles size={16} className="shrink-0" />
      Tienes {pending.length} {pending.length === 1 ? 'tarea pendiente' : 'tareas pendientes'} y tiempo de sobra hoy. Vas bien.
    </div>
  );
}
