import { addDays, format } from 'date-fns';
import type { Habit, HabitLog } from '../types';
import { occursOnDate } from './date';

export interface HabitStats {
  currentStreak: number;
  bestStreak: number;
  completionRate: number; // over the scheduled days in the last 30 days
}

export function computeHabitStats(habit: Habit, logs: HabitLog[], today: Date = new Date()): HabitStats {
  const doneDates = new Set(logs.filter((l) => l.habitId === habit.id && l.done).map((l) => l.date));

  let currentStreak = 0;
  for (let i = 0; i < 3650; i++) {
    const d = addDays(today, -i);
    const key = format(d, 'yyyy-MM-dd');
    const scheduled = occursOnDate(habit.createdAt.slice(0, 10), habit.recurrence, key) || habit.recurrence.freq === 'daily';
    if (!scheduled) continue;
    if (doneDates.has(key)) currentStreak++;
    else break;
  }

  let bestStreak = 0;
  let running = 0;
  for (let i = 3650; i >= 0; i--) {
    const d = addDays(today, -i);
    const key = format(d, 'yyyy-MM-dd');
    const scheduled = occursOnDate(habit.createdAt.slice(0, 10), habit.recurrence, key) || habit.recurrence.freq === 'daily';
    if (!scheduled) continue;
    if (doneDates.has(key)) {
      running++;
      bestStreak = Math.max(bestStreak, running);
    } else {
      running = 0;
    }
  }

  let scheduledCount = 0;
  let doneCount = 0;
  for (let i = 0; i < 30; i++) {
    const d = addDays(today, -i);
    const key = format(d, 'yyyy-MM-dd');
    const scheduled = occursOnDate(habit.createdAt.slice(0, 10), habit.recurrence, key) || habit.recurrence.freq === 'daily';
    if (!scheduled) continue;
    scheduledCount++;
    if (doneDates.has(key)) doneCount++;
  }
  const completionRate = scheduledCount ? Math.round((doneCount / scheduledCount) * 100) : 0;

  return { currentStreak, bestStreak, completionRate };
}

export function last35Days(today: Date = new Date()): string[] {
  return Array.from({ length: 35 }, (_, i) => format(addDays(today, -(34 - i)), 'yyyy-MM-dd'));
}
