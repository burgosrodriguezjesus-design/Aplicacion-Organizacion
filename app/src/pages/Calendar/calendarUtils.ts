import { addDays, startOfWeek, startOfMonth, endOfMonth, endOfWeek, eachDayOfInterval } from 'date-fns';
import { dateKey } from '../../lib/date';

export function weekDays(anchor: Date, weekStartsOn: 0 | 1): string[] {
  const start = startOfWeek(anchor, { weekStartsOn });
  return Array.from({ length: 7 }, (_, i) => dateKey(addDays(start, i)));
}

export function monthGrid(anchor: Date, weekStartsOn: 0 | 1): string[] {
  const start = startOfWeek(startOfMonth(anchor), { weekStartsOn });
  const end = endOfWeek(endOfMonth(anchor), { weekStartsOn });
  return eachDayOfInterval({ start, end }).map(dateKey);
}
