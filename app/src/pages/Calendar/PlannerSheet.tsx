import { useMemo } from 'react';
import { Sparkles } from 'lucide-react';
import { Sheet } from '../../components/ui/Sheet';
import { Button } from '../../components/ui/Button';
import { useStore, tasksOnDate } from '../../store/store';
import { buildDayPlan, type PlanBlock } from '../../lib/scheduler';
import { minutesToTime } from '../../lib/date';

const KIND_STYLE: Record<PlanBlock['kind'], string> = {
  event: 'border-sky-400',
  routine: 'border-zinc-300 dark:border-zinc-600',
  task: 'border-accent',
  break: 'border-amber-300',
  meal: 'border-emerald-400',
};

export function PlannerSheet({ open, onClose, date }: { open: boolean; onClose: () => void; date: string }) {
  const tasks = useStore((s) => s.tasks);
  const events = useStore((s) => s.events);
  const routines = useStore((s) => s.routines);
  const profile = useStore((s) => s.profile);
  const updateTask = useStore((s) => s.updateTask);

  const plan = useMemo(() => {
    if (!open) return [];
    const pending = tasksOnDate(tasks, date).filter((t) => t.status === 'pending' || t.status === 'in_progress');
    const unscheduled = tasks.filter((t) => t.status === 'pending' && !t.date);
    return buildDayPlan({ date, tasks: [...pending, ...unscheduled], events, routines, wake: profile.usualWake, sleep: profile.usualSleep });
  }, [open, date, tasks, events, routines, profile.usualWake, profile.usualSleep]);

  const accept = () => {
    for (const block of plan) {
      if (block.kind === 'task' && block.taskId) {
        updateTask(block.taskId, { date, time: minutesToTime(block.start), duration: block.end - block.start });
      }
    }
    onClose();
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Organizar mi día"
      footer={
        <div className="flex gap-2">
          <Button variant="secondary" fullWidth onClick={onClose}>Rechazar</Button>
          <Button variant="primary" fullWidth onClick={accept} disabled={!plan.some((b) => b.kind === 'task')}>Aceptar plan</Button>
        </div>
      }
    >
      <div className="mb-3 flex items-start gap-2 rounded-xl bg-accent/10 p-3 text-xs text-accent">
        <Sparkles size={15} className="mt-0.5 shrink-0" />
        He tenido en cuenta tus eventos, rutinas, prioridades y el tiempo disponible entre {profile.usualWake} y {profile.usualSleep}.
      </div>
      {plan.length === 0 ? (
        <p className="py-6 text-center text-sm text-zinc-400">No hay nada que organizar todavía. Añade tareas pendientes primero.</p>
      ) : (
        <div className="space-y-1.5">
          {plan.map((b) => (
            <div key={b.id} className={`flex items-center gap-2.5 rounded-lg border-l-4 bg-zinc-50 px-3 py-2 text-sm dark:bg-zinc-800/50 ${KIND_STYLE[b.kind]}`}>
              <span className="w-11 shrink-0 font-semibold tabular-nums text-zinc-400">{minutesToTime(b.start)}</span>
              <span className="flex-1 text-zinc-700 dark:text-zinc-200">{b.title}</span>
              {b.kind === 'break' && <span className="text-[10px] uppercase text-amber-500">descanso</span>}
              {b.kind === 'meal' && <span className="text-[10px] uppercase text-emerald-500">comida</span>}
            </div>
          ))}
        </div>
      )}
      <p className="mt-3 text-center text-[11px] text-zinc-400">Puedes modificar cualquier tarea después desde el calendario.</p>
    </Sheet>
  );
}
