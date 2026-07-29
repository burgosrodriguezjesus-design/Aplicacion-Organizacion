import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Task } from '../../types';
import { StatusToggle } from '../../components/ui/StatusToggle';
import { CategoryChip } from '../../components/ui/Meta';
import { useStore, taskStatusOnDate } from '../../store/store';
import { useUiStore } from '../../store/uiStore';
import { todayKey, formatDuration } from '../../lib/date';
import { PRIORITY_META } from '../../types';
import { ListChecks } from 'lucide-react';

export function TaskRow({ task }: { task: Task }) {
  const setTaskStatusForDate = useStore((s) => s.setTaskStatusForDate);
  const setEditingTaskId = useUiStore((s) => s.setEditingTaskId);
  const today = todayKey();
  const status = taskStatusOnDate(task, today);
  const doneSubtasks = task.subtasks.filter((s) => s.done).length;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => setEditingTaskId(task.id)}
      onKeyDown={(e) => { if (e.key === 'Enter') setEditingTaskId(task.id); }}
      className="flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-transparent bg-white px-3 py-3 text-left shadow-sm transition-colors hover:border-zinc-200 dark:bg-zinc-900 dark:hover:border-zinc-800"
    >
      <StatusToggle status={status} onChange={(s) => setTaskStatusForDate(task.id, today, s)} />
      <div className="min-w-0 flex-1">
        <p className={`truncate text-sm font-medium ${status === 'completed' ? 'text-zinc-400 line-through' : 'text-zinc-800 dark:text-zinc-100'}`}>
          {task.title}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-zinc-400">
          <span>{PRIORITY_META[task.priority].emoji}</span>
          {task.date && <span>{task.date === today ? 'Hoy' : format(new Date(task.date + 'T00:00:00'), "d 'de' MMM", { locale: es })}</span>}
          {task.time && <span>· {task.time}</span>}
          {task.duration && <span>· {formatDuration(task.duration)}</span>}
          {task.subtasks.length > 0 && (
            <span className="flex items-center gap-0.5"><ListChecks size={11} /> {doneSubtasks}/{task.subtasks.length}</span>
          )}
          {task.categoryId && <CategoryChip categoryId={task.categoryId} />}
        </div>
      </div>
    </div>
  );
}
