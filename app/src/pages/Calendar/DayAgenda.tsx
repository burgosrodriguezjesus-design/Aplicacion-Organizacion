import { useDraggable, useDroppable } from '@dnd-kit/core';
import type { CalendarEvent, Task } from '../../types';
import { eventsOnDate, eventStatusOnDate, tasksOnDate, taskStatusOnDate } from '../../store/store';
import { useStore } from '../../store/store';
import { useUiStore } from '../../store/uiStore';
import { CategoryChip } from '../../components/ui/Meta';

interface AgendaEntry {
  key: string;
  type: 'event' | 'task';
  id: string;
  title: string;
  time?: string;
  endTime?: string;
  categoryId?: string;
  status: string;
  priority?: Task['priority'];
}

export function buildAgenda(date: string, tasks: Task[], events: CalendarEvent[]): AgendaEntry[] {
  const list: AgendaEntry[] = [];
  for (const e of eventsOnDate(events, date)) {
    list.push({ key: `event:${e.id}`, type: 'event', id: e.id, title: e.title, time: e.startTime, endTime: e.endTime, categoryId: e.categoryId, status: eventStatusOnDate(e, date) });
  }
  for (const t of tasksOnDate(tasks, date)) {
    if (!t.time) continue;
    list.push({ key: `task:${t.id}`, type: 'task', id: t.id, title: t.title, time: t.time, categoryId: t.categoryId, status: taskStatusOnDate(t, date), priority: t.priority });
  }
  list.sort((a, b) => (a.time || '').localeCompare(b.time || ''));
  return list;
}

export function AgendaChip({ entry, compact }: { entry: AgendaEntry; compact?: boolean }) {
  const setEditingEventId = useUiStore((s) => s.setEditingEventId);
  const setEditingTaskId = useUiStore((s) => s.setEditingTaskId);
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: entry.key, data: entry });

  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;
  const isDone = entry.status === 'completed';

  if (compact) {
    return (
      <button
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        onClick={() => (entry.type === 'event' ? setEditingEventId(entry.id) : setEditingTaskId(entry.id))}
        className={`block w-full overflow-hidden rounded-lg border-l-4 bg-white px-1.5 py-1 text-left text-[10px] leading-tight shadow-sm transition-opacity dark:bg-zinc-900 ${isDragging ? 'opacity-30' : ''} ${
          entry.type === 'event' ? 'border-sky-400' : 'border-accent'
        }`}
      >
        <span className="block font-semibold tabular-nums text-zinc-400">{entry.time}</span>
        <span className={`block truncate ${isDone ? 'text-zinc-400 line-through' : 'text-zinc-700 dark:text-zinc-200'}`}>{entry.title}</span>
      </button>
    );
  }

  return (
    <button
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={() => (entry.type === 'event' ? setEditingEventId(entry.id) : setEditingTaskId(entry.id))}
      className={`flex w-full items-center gap-2 overflow-hidden rounded-lg border-l-4 bg-white px-2.5 py-1.5 text-left text-xs shadow-sm transition-opacity dark:bg-zinc-900 ${isDragging ? 'opacity-30' : ''} ${
        entry.type === 'event' ? 'border-sky-400' : 'border-accent'
      }`}
    >
      <span className="shrink-0 font-semibold tabular-nums text-zinc-400">{entry.time}</span>
      <span className={`min-w-0 flex-1 truncate ${isDone ? 'text-zinc-400 line-through' : 'text-zinc-700 dark:text-zinc-200'}`}>{entry.title}</span>
      {entry.categoryId && (
        <span className="min-w-0 shrink truncate">
          <CategoryChip categoryId={entry.categoryId} />
        </span>
      )}
    </button>
  );
}

export function DayColumn({ date, compact }: { date: string; compact?: boolean }) {
  const tasks = useStore((s) => s.tasks);
  const events = useStore((s) => s.events);
  const setEditingEventId = useUiStore((s) => s.setEditingEventId);
  const setNewItemDate = useUiStore((s) => s.setNewItemDate);
  const { setNodeRef, isOver } = useDroppable({ id: `day:${date}` });

  const entries = buildAgenda(date, tasks, events);

  const createHere = () => {
    setNewItemDate(date);
    setEditingEventId('new');
  };

  return (
    <div
      ref={setNodeRef}
      className={`flex min-h-[120px] flex-col gap-1.5 rounded-xl p-1.5 transition-colors ${isOver ? 'bg-accent/10' : ''}`}
    >
      {entries.map((e) => <AgendaChip key={e.key} entry={e} compact={compact} />)}
      <button
        onClick={createHere}
        className={`rounded-lg border border-dashed border-zinc-200 text-zinc-400 hover:border-accent hover:text-accent dark:border-zinc-800 ${compact ? 'py-1 text-[10px]' : 'mt-1 py-1.5 text-[11px]'}`}
      >
        {compact ? '+' : '+ Evento'}
      </button>
    </div>
  );
}
