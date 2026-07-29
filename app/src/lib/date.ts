import { format, parseISO, differenceInCalendarDays, differenceInCalendarWeeks, getDay, getDate as getDayOfMonth, getMonth } from 'date-fns';

export const dateKey = (d: Date): string => format(d, 'yyyy-MM-dd');
export const timeKey = (d: Date): string => format(d, 'HH:mm');

export const todayKey = (): string => dateKey(new Date());

export function toMinutes(time?: string): number {
  if (!time) return 0;
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export function minutesToTime(mins: number): string {
  const h = Math.floor(((mins % 1440) + 1440) % 1440 / 60);
  const m = ((mins % 60) + 60) % 60;
  return `${String(h).padStart(2, '0')}:${String(Math.round(m)).padStart(2, '0')}`;
}

export function formatDuration(mins?: number): string {
  if (!mins) return '';
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

export function safeParseISO(dateStr: string): Date {
  return parseISO(dateStr);
}

export function occursOnDate(baseDateStr: string | undefined, recurrence: { freq: string; daysOfWeek?: number[] }, targetDateStr: string): boolean {
  if (!baseDateStr) return false;
  if (targetDateStr < baseDateStr) return false;
  const base = safeParseISO(baseDateStr);
  const target = safeParseISO(targetDateStr);

  switch (recurrence.freq) {
    case 'none':
      return baseDateStr === targetDateStr;
    case 'daily':
      return true;
    case 'weekdays': {
      const day = getDay(target);
      return day !== 0 && day !== 6;
    }
    case 'weekly':
      return getDay(base) === getDay(target);
    case 'biweekly': {
      if (getDay(base) !== getDay(target)) return false;
      const weeks = differenceInCalendarWeeks(target, base, { weekStartsOn: 1 });
      return weeks % 2 === 0;
    }
    case 'monthly':
      return getDayOfMonth(base) === getDayOfMonth(target);
    case 'yearly':
      return getMonth(base) === getMonth(target) && getDayOfMonth(base) === getDayOfMonth(target);
    case 'custom':
      return (recurrence.daysOfWeek || []).includes(getDay(target));
    default:
      return baseDateStr === targetDateStr;
  }
}

export function isRecurring(recurrence: { freq: string }): boolean {
  return recurrence.freq !== 'none';
}

export function daysBetween(a: string, b: string): number {
  return differenceInCalendarDays(safeParseISO(b), safeParseISO(a));
}

export const WEEKDAY_LABELS_SHORT = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
export const WEEKDAY_LABELS_LONG = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
export const MONTH_LABELS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];
