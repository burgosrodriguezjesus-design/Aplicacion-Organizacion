export type ID = string;

export type Priority = 'urgent' | 'important' | 'normal' | 'low';

export const PRIORITY_META: Record<Priority, { label: string; emoji: string; color: string; order: number }> = {
  urgent: { label: 'Urgente', emoji: '🔴', color: '#ef4444', order: 0 },
  important: { label: 'Importante', emoji: '🟠', color: '#f97316', order: 1 },
  normal: { label: 'Normal', emoji: '🟡', color: '#eab308', order: 2 },
  low: { label: 'Baja', emoji: '⚪', color: '#94a3b8', order: 3 },
};

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'skipped';

export type RecurrenceFreq =
  | 'none'
  | 'daily'
  | 'weekdays'
  | 'weekly'
  | 'biweekly'
  | 'monthly'
  | 'yearly'
  | 'custom';

export interface Recurrence {
  freq: RecurrenceFreq;
  daysOfWeek?: number[]; // 0 = Sunday ... 6 = Saturday, used for 'custom'/'weekly' anchor
}

export const NO_RECURRENCE: Recurrence = { freq: 'none' };

export interface SubTask {
  id: ID;
  title: string;
  done: boolean;
}

export interface ReminderConfig {
  enabled: boolean;
  minutesBefore: number; // 0 = at time
}

export interface Task {
  id: ID;
  title: string;
  description?: string;
  date?: string; // yyyy-MM-dd
  time?: string; // HH:mm
  duration?: number; // minutes
  priority: Priority;
  categoryId?: ID;
  tags: string[];
  recurrence: Recurrence;
  reminder?: ReminderConfig;
  subtasks: SubTask[];
  status: TaskStatus; // used when recurrence.freq === 'none'
  completedDates: string[]; // used when recurring
  skippedDates: string[]; // used when recurring
  goalId?: ID;
  createdAt: string;
  completedAt?: string;
}

export interface CalendarEvent {
  id: ID;
  title: string;
  date: string; // yyyy-MM-dd (first occurrence)
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  location?: string;
  notes?: string;
  categoryId?: ID;
  recurrence: Recurrence;
  reminder?: ReminderConfig;
  status: TaskStatus;
  completedDates: string[];
  skippedDates: string[];
  createdAt: string;
}

export interface Habit {
  id: ID;
  name: string;
  icon: string;
  recurrence: Recurrence;
  categoryId?: ID;
  reminderTime?: string;
  createdAt: string;
  archived?: boolean;
}

export interface HabitLog {
  id: ID;
  habitId: ID;
  date: string; // yyyy-MM-dd
  done: boolean;
}

export type GoalPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

export const GOAL_PERIOD_META: Record<GoalPeriod, string> = {
  daily: 'Diario',
  weekly: 'Semanal',
  monthly: 'Mensual',
  yearly: 'Anual',
};

export type GoalStepStatus = 'pending' | 'in_progress' | 'done';

export interface GoalStep {
  id: ID;
  title: string;
  status: GoalStepStatus;
}

export interface Goal {
  id: ID;
  title: string;
  description?: string;
  period: GoalPeriod;
  date: string; // reference date (yyyy-MM-dd) placing it in a day/week/month/year
  categoryId?: ID;
  steps: GoalStep[];
  archived?: boolean;
  createdAt: string;
}

export type ReminderType = 'task' | 'event' | 'habit' | 'payment' | 'appointment' | 'custom';

export interface Reminder {
  id: ID;
  title: string;
  date: string;
  time: string;
  type: ReminderType;
  linkedId?: ID;
  recurrence: Recurrence;
  minutesBefore: number;
  done: boolean;
  createdAt: string;
}

export type NoteType = 'quick' | 'list' | 'idea' | 'apunte';

export interface NoteListItem {
  id: ID;
  text: string;
  done: boolean;
}

export interface Note {
  id: ID;
  title: string;
  content: string;
  type: NoteType;
  listItems?: NoteListItem[];
  linkedTaskId?: ID;
  linkedGoalId?: ID;
  categoryId?: ID;
  pinned?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: ID;
  name: string;
  color: string;
  icon: string;
  builtin?: boolean;
}

export interface RoutineStep {
  id: ID;
  time: string;
  title: string;
}

export type RoutineType = 'morning' | 'night' | 'custom';

export interface Routine {
  id: ID;
  name: string;
  type: RoutineType;
  icon: string;
  steps: RoutineStep[];
  activeDays: number[]; // 0-6
  enabled: boolean;
  createdAt: string;
}

export interface InboxItem {
  id: ID;
  text: string;
  createdAt: string;
}

export interface UserProfile {
  name: string;
  avatarEmoji: string;
  theme: 'light' | 'dark' | 'system';
  accentColor: string;
  weekStartsOn: 0 | 1;
  pomodoroWork: number;
  pomodoroBreak: number;
  usualWake: string;
  usualSleep: string;
  notificationsEnabled: boolean;
}

export interface TimelineEntry {
  key: string; // `${type}:${id}[:${stepId}]`
  type: 'task' | 'event' | 'routine';
  id: ID;
  stepId?: ID;
  title: string;
  icon?: string;
  time?: string;
  duration?: number;
  status: TaskStatus;
  priority?: Priority;
  categoryId?: ID;
  order: number;
}
