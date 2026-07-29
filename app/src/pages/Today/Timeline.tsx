import { useMemo } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { TimelineItem } from './TimelineItem';
import { useStore } from '../../store/store';
import { buildTimeline } from '../../lib/today';
import type { TaskStatus } from '../../types';
import { EmptyState } from '../../components/ui/EmptyState';
import { useUiStore } from '../../store/uiStore';
import { CalendarClock } from 'lucide-react';

export function Timeline({ date }: { date: string }) {
  const tasks = useStore((s) => s.tasks);
  const events = useStore((s) => s.events);
  const routines = useStore((s) => s.routines);
  const routineStepStatus = useStore((s) => s.routineStepStatus);
  const dailyOrder = useStore((s) => s.dailyOrder[date]);
  const setDailyOrder = useStore((s) => s.setDailyOrder);
  const setTaskStatusForDate = useStore((s) => s.setTaskStatusForDate);
  const setEventStatusForDate = useStore((s) => s.setEventStatusForDate);
  const setRoutineStepStatus = useStore((s) => s.setRoutineStepStatus);
  const setEditingTaskId = useUiStore((s) => s.setEditingTaskId);
  const setEditingEventId = useUiStore((s) => s.setEditingEventId);

  const entries = useMemo(
    () => buildTimeline(date, tasks, events, routines, routineStepStatus, dailyOrder),
    [date, tasks, events, routines, routineStepStatus, dailyOrder],
  );

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = entries.findIndex((it) => it.key === active.id);
    const newIndex = entries.findIndex((it) => it.key === over.id);
    const reordered = arrayMove(entries, oldIndex, newIndex);
    const order: Record<string, number> = {};
    reordered.forEach((it, i) => { order[it.key] = i; });
    setDailyOrder(date, order);
  };

  const setStatus = (entry: (typeof entries)[number], status: TaskStatus) => {
    if (entry.type === 'task') setTaskStatusForDate(entry.id, date, status);
    else if (entry.type === 'event') setEventStatusForDate(entry.id, date, status);
    else if (entry.type === 'routine' && entry.stepId) setRoutineStepStatus(entry.id, entry.stepId, date, status);
  };

  const openEntry = (entry: (typeof entries)[number]) => {
    if (entry.type === 'task') setEditingTaskId(entry.id);
    else if (entry.type === 'event') setEditingEventId(entry.id);
  };

  if (!entries.length) {
    return (
      <EmptyState
        icon={<CalendarClock className="text-zinc-300" />}
        title="Nada programado todavía"
        subtitle='Pulsa el botón "+" para añadir tu primera tarea, evento o hábito del día.'
      />
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={entries.map((e) => e.key)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {entries.map((entry) => (
            <TimelineItem key={entry.key} entry={entry} onStatusChange={(s) => setStatus(entry, s)} onOpen={() => openEntry(entry)} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
