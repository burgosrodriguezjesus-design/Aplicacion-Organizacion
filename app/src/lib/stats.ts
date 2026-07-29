import { addDays, format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Task, CalendarEvent, Habit, HabitLog, Category } from '../types';
import { taskStatusOnDate, eventsOnDate, eventStatusOnDate } from '../store/store';

export function taskCompletionSummary(tasks: Task[], today: string) {
  let completed = 0;
  let pending = 0;
  for (const t of tasks) {
    const status = taskStatusOnDate(t, today);
    if (status === 'completed') completed++;
    else if (status === 'pending' || status === 'in_progress') pending++;
  }
  const total = completed + pending;
  return { completed, pending, rate: total ? Math.round((completed / total) * 100) : 0 };
}

export function habitsCompletionSummary(habits: Habit[], logs: HabitLog[], today: string) {
  const todaysLogs = logs.filter((l) => l.date === today);
  const completed = todaysLogs.filter((l) => l.done).length;
  return { completed, total: habits.length };
}

export function hoursByCategory(tasks: Task[], events: CalendarEvent[], categories: Category[], days = 30) {
  const today = new Date();
  const map = new Map<string, number>();
  for (let i = 0; i < days; i++) {
    const d = format(addDays(today, -i), 'yyyy-MM-dd');
    for (const t of tasks) {
      if (t.date !== d) continue;
      if (taskStatusOnDate(t, d) !== 'completed') continue;
      const cat = t.categoryId || 'sin-categoria';
      map.set(cat, (map.get(cat) || 0) + (t.duration || 30));
    }
    for (const e of eventsOnDate(events, d)) {
      if (eventStatusOnDate(e, d) !== 'completed') continue;
      const cat = e.categoryId || 'sin-categoria';
      const dur = (Number(e.endTime.slice(0, 2)) * 60 + Number(e.endTime.slice(3))) - (Number(e.startTime.slice(0, 2)) * 60 + Number(e.startTime.slice(3)));
      map.set(cat, (map.get(cat) || 0) + Math.max(0, dur));
    }
  }
  return categories
    .map((c) => ({ name: c.name, color: c.color, hours: Math.round(((map.get(c.id) || 0) / 60) * 10) / 10 }))
    .filter((c) => c.hours > 0)
    .sort((a, b) => b.hours - a.hours);
}

export function last7DaysProductivity(tasks: Task[]) {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = format(addDays(today, -(6 - i)), 'yyyy-MM-dd');
    const completed = tasks.filter((t) => taskStatusOnDate(t, d) === 'completed' && (t.date === d || t.recurrence.freq !== 'none')).length;
    return { date: d, label: format(addDays(today, -(6 - i)), 'EEEEEE', { locale: es }), completed };
  });
}
