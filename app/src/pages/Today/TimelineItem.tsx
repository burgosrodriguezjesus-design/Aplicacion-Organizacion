import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import type { TimelineEntry } from '../../types';
import { StatusToggle } from '../../components/ui/StatusToggle';
import { CategoryChip, PriorityBadge } from '../../components/ui/Meta';
import { formatDuration } from '../../lib/date';
import { useNavigate } from 'react-router-dom';

export function TimelineItem({ entry, onStatusChange, onOpen }: { entry: TimelineEntry; onStatusChange: (status: TimelineEntry['status']) => void; onOpen: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: entry.key });
  const navigate = useNavigate();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isDone = entry.status === 'completed';
  const isSkipped = entry.status === 'skipped';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-3 rounded-2xl border border-transparent bg-white px-3 py-3 shadow-sm transition-colors hover:border-zinc-200 dark:bg-zinc-900 dark:hover:border-zinc-800 ${isDragging ? 'z-10 shadow-lg' : ''}`}
    >
      <button {...attributes} {...listeners} className="shrink-0 cursor-grab touch-none text-zinc-300 active:cursor-grabbing dark:text-zinc-700">
        <GripVertical size={16} />
      </button>

      <div className="w-12 shrink-0 text-xs font-semibold tabular-nums text-zinc-400">{entry.time}</div>

      <StatusToggle status={entry.status} onChange={onStatusChange} />

      <button onClick={onOpen} className="min-w-0 flex-1 text-left">
        <p className={`truncate text-sm font-medium ${isDone || isSkipped ? 'text-zinc-400 line-through' : 'text-zinc-800 dark:text-zinc-100'}`}>
          {entry.icon ? `${entry.icon} ` : ''}{entry.title}
        </p>
        <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
          {entry.duration ? <span className="text-[11px] text-zinc-400">{formatDuration(entry.duration)}</span> : null}
          {entry.priority && <PriorityBadge priority={entry.priority} />}
          {entry.categoryId && <CategoryChip categoryId={entry.categoryId} />}
        </div>
      </button>

      {entry.type === 'task' && entry.status !== 'completed' && entry.status !== 'skipped' && (
        <button
          onClick={() => navigate(`/foco/${entry.id}`)}
          className="hidden shrink-0 rounded-lg px-2 py-1 text-[11px] font-medium text-accent opacity-0 transition-opacity hover:bg-accent/10 group-hover:opacity-100 sm:block"
        >
          Foco
        </button>
      )}
    </div>
  );
}
