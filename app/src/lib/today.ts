import type { Task, CalendarEvent, Routine, TimelineEntry } from '../types';
import { tasksOnDate, eventsOnDate, taskStatusOnDate, eventStatusOnDate, routineActiveOnDate } from '../store/store';
import { toMinutes } from './date';

export function buildTimeline(
  date: string,
  tasks: Task[],
  events: CalendarEvent[],
  routines: Routine[],
  routineStepStatus: Record<string, string>,
  dailyOrder: Record<string, number> | undefined,
): TimelineEntry[] {
  const entries: TimelineEntry[] = [];

  for (const t of tasksOnDate(tasks, date)) {
    if (!t.time) continue;
    const key = `task:${t.id}`;
    entries.push({
      key, type: 'task', id: t.id, title: t.title, time: t.time, duration: t.duration,
      status: taskStatusOnDate(t, date), priority: t.priority, categoryId: t.categoryId,
      order: dailyOrder?.[key] ?? toMinutes(t.time),
    });
  }

  for (const e of eventsOnDate(events, date)) {
    const key = `event:${e.id}`;
    entries.push({
      key, type: 'event', id: e.id, title: e.title, time: e.startTime,
      duration: toMinutes(e.endTime) - toMinutes(e.startTime), status: eventStatusOnDate(e, date),
      categoryId: e.categoryId, order: dailyOrder?.[key] ?? toMinutes(e.startTime),
    });
  }

  for (const r of routines) {
    if (!routineActiveOnDate(r, date)) continue;
    for (const step of r.steps) {
      const key = `routine:${r.id}:${step.id}`;
      const status = (routineStepStatus[`${date}:${r.id}:${step.id}`] as TimelineEntry['status']) || 'pending';
      entries.push({
        key, type: 'routine', id: r.id, stepId: step.id, title: step.title, icon: r.icon, time: step.time,
        status, order: dailyOrder?.[key] ?? toMinutes(step.time),
      });
    }
  }

  entries.sort((a, b) => a.order - b.order);
  return entries;
}

export function dayProgressPct(now: Date, wake: string, sleep: string): number {
  const wakeMin = toMinutes(wake);
  let sleepMin = toMinutes(sleep);
  if (sleepMin <= wakeMin) sleepMin += 24 * 60;
  let nowMin = now.getHours() * 60 + now.getMinutes();
  if (nowMin < wakeMin) nowMin += 24 * 60;
  const pct = ((nowMin - wakeMin) / (sleepMin - wakeMin)) * 100;
  return Math.max(0, Math.min(100, Math.round(pct)));
}

export function greeting(now: Date): string {
  const h = now.getHours();
  if (h < 6) return 'Buenas noches';
  if (h < 12) return 'Buenos días';
  if (h < 20) return 'Buenas tardes';
  return 'Buenas noches';
}

export function freeMinutesLeft(entries: TimelineEntry[], now: Date, sleep: string): number {
  const nowMin = now.getHours() * 60 + now.getMinutes();
  let sleepMin = toMinutes(sleep);
  if (sleepMin <= nowMin) return 0;
  const busy = entries
    .filter((e) => e.time)
    .reduce((sum, e) => {
      const start = toMinutes(e.time);
      const end = start + (e.duration || 30);
      const overlapStart = Math.max(start, nowMin);
      const overlapEnd = Math.min(end, sleepMin);
      return sum + Math.max(0, overlapEnd - overlapStart);
    }, 0);
  return Math.max(0, sleepMin - nowMin - busy);
}
