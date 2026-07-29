import type { Task } from '../types';
import { taskStatusOnDate, tasksOnDate } from '../store/store';

export interface TaskGroups {
  today: Task[];
  important: Task[];
  upcoming: Task[];
  whenever: Task[];
  completed: Task[];
}

export function groupTasks(tasks: Task[], todayStr: string): TaskGroups {
  const todaysIds = new Set(tasksOnDate(tasks, todayStr).map((t) => t.id));
  const today: Task[] = [];
  const important: Task[] = [];
  const upcoming: Task[] = [];
  const whenever: Task[] = [];
  const completed: Task[] = [];

  for (const t of tasks) {
    const status = taskStatusOnDate(t, todayStr);
    if (status === 'completed') {
      completed.push(t);
      continue;
    }
    if (status === 'skipped') continue;
    if (todaysIds.has(t.id)) {
      today.push(t);
      continue;
    }
    if (t.priority === 'urgent' || t.priority === 'important') {
      important.push(t);
      continue;
    }
    if (t.date && t.date > todayStr) {
      upcoming.push(t);
      continue;
    }
    whenever.push(t);
  }

  const byPriority = (a: Task, b: Task) => {
    const order = { urgent: 0, important: 1, normal: 2, low: 3 } as const;
    return order[a.priority] - order[b.priority];
  };
  today.sort((a, b) => (a.time || '99:99').localeCompare(b.time || '99:99'));
  important.sort(byPriority);
  upcoming.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  whenever.sort(byPriority);
  completed.sort((a, b) => (b.completedAt || '').localeCompare(a.completedAt || ''));

  return { today, important, upcoming, whenever, completed };
}
