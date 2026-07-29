import { useStore } from '../../store/store';
import { DayColumn, buildAgenda } from './DayAgenda';
import { EmptyState } from '../../components/ui/EmptyState';
import { CalendarDays } from 'lucide-react';

export function DayView({ date }: { date: string }) {
  const tasks = useStore((s) => s.tasks);
  const events = useStore((s) => s.events);
  const entries = buildAgenda(date, tasks, events);

  return (
    <div className="mx-auto max-w-md">
      {entries.length === 0 && (
        <EmptyState icon={<CalendarDays className="text-zinc-300" />} title="Nada programado" subtitle="Añade un evento para este día." />
      )}
      <div className="mt-3">
        <DayColumn date={date} />
      </div>
    </div>
  );
}
