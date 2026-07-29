import type { Task, CalendarEvent, Routine, Priority } from '../types';
import { toMinutes, minutesToTime } from './date';
import { eventsOnDate, routineActiveOnDate } from '../store/store';

export interface PlanBlock {
  id: string;
  start: number; // minutes from midnight
  end: number;
  title: string;
  kind: 'event' | 'routine' | 'task' | 'break' | 'meal';
  taskId?: string;
  priority?: Priority;
}

const PRIORITY_ORDER: Record<Priority, number> = { urgent: 0, important: 1, normal: 2, low: 3 };

interface PlanInput {
  date: string;
  tasks: Task[];
  events: CalendarEvent[];
  routines: Routine[];
  wake: string;
  sleep: string;
}

/**
 * Builds a suggested day plan by placing pending tasks into the free gaps
 * left by fixed events/routines, inserting short breaks and meal windows.
 * This is a simple greedy heuristic, not a general solver — intentionally
 * kept easy to reason about and to override.
 */
export function buildDayPlan({ date, tasks, events, routines, wake, sleep }: PlanInput): PlanBlock[] {
  const dayStart = toMinutes(wake);
  const dayEnd = toMinutes(sleep);

  const fixed: PlanBlock[] = [];

  for (const e of eventsOnDate(events, date)) {
    fixed.push({ id: `event-${e.id}`, start: toMinutes(e.startTime), end: toMinutes(e.endTime), title: e.title, kind: 'event' });
  }
  for (const r of routines) {
    if (!routineActiveOnDate(r, date)) continue;
    for (const step of r.steps) {
      const start = toMinutes(step.time);
      fixed.push({ id: `routine-${r.id}-${step.id}`, start, end: start + 10, title: step.title, kind: 'routine' });
    }
  }

  // Suggested meal windows, only added if the slot is free.
  const mealCandidates: [number, number, string][] = [
    [13 * 60 + 30, 14 * 60 + 30, 'Comer'],
    [20 * 60 + 30, 21 * 60, 'Cenar'],
  ];

  fixed.sort((a, b) => a.start - b.start);

  const isFree = (start: number, end: number) => fixed.every((b) => end <= b.start || start >= b.end);

  for (const [start, end, title] of mealCandidates) {
    if (start >= dayStart && end <= dayEnd && isFree(start, end)) {
      fixed.push({ id: `meal-${title}`, start, end, title, kind: 'meal' });
    }
  }
  fixed.sort((a, b) => a.start - b.start);

  // Gaps between fixed blocks (bounded by wake/sleep).
  const gaps: [number, number][] = [];
  let cursor = dayStart;
  for (const b of fixed) {
    if (b.start > cursor) gaps.push([cursor, b.start]);
    cursor = Math.max(cursor, b.end);
  }
  if (cursor < dayEnd) gaps.push([cursor, dayEnd]);

  const pendingTasks = tasks
    .filter((t) => t.status === 'pending' || t.status === 'in_progress')
    .slice()
    .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);

  const placed: PlanBlock[] = [];
  let workStreak = 0;

  for (const [gapStart, gapEnd] of gaps) {
    let t = gapStart;
    while (t < gapEnd && pendingTasks.length) {
      if (workStreak >= 90 && gapEnd - t > 15) {
        placed.push({ id: `break-${t}`, start: t, end: t + 15, title: 'Descanso', kind: 'break' });
        t += 15;
        workStreak = 0;
        continue;
      }
      const task = pendingTasks[0];
      const duration = Math.min(task.duration || 30, gapEnd - t);
      if (duration < 10) break;
      placed.push({ id: `task-${task.id}`, start: t, end: t + duration, title: task.title, kind: 'task', taskId: task.id, priority: task.priority });
      t += duration;
      workStreak += duration;
      pendingTasks.shift();
    }
  }

  const all = [...fixed, ...placed].sort((a, b) => a.start - b.start);
  return all;
}

export function planBlockLabel(b: PlanBlock): string {
  return `${minutesToTime(b.start)} — ${b.title}`;
}
