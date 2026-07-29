import { useMemo } from 'react';
import { DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { useStore } from '../../store/store';
import { weekDays } from './calendarUtils';
import { todayKey } from '../../lib/date';
import { DayColumn } from './DayAgenda';

export function WeekView({ anchor, onSelectDay }: { anchor: Date; onSelectDay: (date: string) => void }) {
  const weekStartsOn = useStore((s) => s.profile.weekStartsOn);
  const updateEvent = useStore((s) => s.updateEvent);
  const updateTask = useStore((s) => s.updateTask);
  const today = todayKey();

  const days = useMemo(() => weekDays(anchor, weekStartsOn), [anchor, weekStartsOn]);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over) return;
    const targetDate = String(over.id).replace('day:', '');
    const [type, id] = String(active.id).split(':');
    if (type === 'event') updateEvent(id, { date: targetDate });
    else if (type === 'task') updateTask(id, { date: targetDate });
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((d) => (
          <div key={d}>
            <button
              onClick={() => onSelectDay(d)}
              className={`mb-1.5 w-full rounded-lg py-1 text-center text-xs font-semibold transition-colors ${
                d === today ? 'bg-accent text-white' : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              {new Date(d + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'short' })}<br />{Number(d.slice(8, 10))}
            </button>
            <DayColumn date={d} compact />
          </div>
        ))}
      </div>
    </DndContext>
  );
}
