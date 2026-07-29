import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuid } from 'uuid';
import type {
  Category, Task, CalendarEvent, Habit, HabitLog, Goal, GoalStep, Reminder, Note, Routine, RoutineStep,
  InboxItem, UserProfile, TaskStatus, SubTask, GoalPeriod,
} from '../types';
import { DEFAULT_CATEGORIES, DEFAULT_PROFILE, buildSeedData } from './seed';
import { occursOnDate } from '../lib/date';

interface StoreState {
  categories: Category[];
  tasks: Task[];
  events: CalendarEvent[];
  habits: Habit[];
  habitLogs: HabitLog[];
  goals: Goal[];
  reminders: Reminder[];
  notes: Note[];
  routines: Routine[];
  routineStepStatus: Record<string, TaskStatus>;
  inboxItems: InboxItem[];
  dailyOrder: Record<string, Record<string, number>>;
  profile: UserProfile;
  onboarded: boolean;

  // Categories
  addCategory: (name: string, color: string, icon: string) => void;
  updateCategory: (id: string, patch: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  // Tasks
  addTask: (task: Partial<Task> & { title: string }) => string;
  updateTask: (id: string, patch: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  setTaskStatusForDate: (id: string, date: string, status: TaskStatus) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  addSubtask: (taskId: string, title: string) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;

  // Events
  addEvent: (event: Partial<CalendarEvent> & { title: string }) => string;
  updateEvent: (id: string, patch: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;
  setEventStatusForDate: (id: string, date: string, status: TaskStatus) => void;

  // Habits
  addHabit: (habit: Partial<Habit> & { name: string }) => string;
  updateHabit: (id: string, patch: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  toggleHabitLog: (habitId: string, date: string) => void;

  // Goals
  addGoal: (goal: Partial<Goal> & { title: string; period: GoalPeriod }) => string;
  updateGoal: (id: string, patch: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  addGoalStep: (goalId: string, title: string) => void;
  updateGoalStep: (goalId: string, stepId: string, patch: Partial<GoalStep>) => void;
  cycleGoalStep: (goalId: string, stepId: string) => void;
  deleteGoalStep: (goalId: string, stepId: string) => void;

  // Reminders
  addReminder: (reminder: Partial<Reminder> & { title: string }) => string;
  updateReminder: (id: string, patch: Partial<Reminder>) => void;
  deleteReminder: (id: string) => void;
  toggleReminderDone: (id: string) => void;

  // Notes
  addNote: (note: Partial<Note> & { title: string }) => string;
  updateNote: (id: string, patch: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  togglePinNote: (id: string) => void;

  // Routines
  addRoutine: (routine: Partial<Routine> & { name: string; type: Routine['type'] }) => string;
  updateRoutine: (id: string, patch: Partial<Routine>) => void;
  deleteRoutine: (id: string) => void;
  addRoutineStep: (routineId: string, time: string, title: string) => void;
  updateRoutineStep: (routineId: string, stepId: string, patch: Partial<RoutineStep>) => void;
  deleteRoutineStep: (routineId: string, stepId: string) => void;
  setRoutineStepStatus: (routineId: string, stepId: string, date: string, status: TaskStatus) => void;

  // Inbox
  addInboxItem: (text: string) => void;
  deleteInboxItem: (id: string) => void;
  convertInboxItem: (id: string, type: 'task' | 'event' | 'note' | 'reminder') => void;

  // Ordering (today's timeline manual drag order)
  setDailyOrder: (date: string, order: Record<string, number>) => void;

  // Profile
  updateProfile: (patch: Partial<UserProfile>) => void;

  // Bulk
  resetDemoData: () => void;
  clearAllData: () => void;
}

const now = () => new Date().toISOString();

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      categories: DEFAULT_CATEGORIES,
      ...buildSeedData(),
      routineStepStatus: {},
      dailyOrder: {},
      profile: DEFAULT_PROFILE,
      onboarded: false,

      addCategory: (name, color, icon) =>
        set((s) => ({ categories: [...s.categories, { id: uuid(), name, color, icon }] })),
      updateCategory: (id, patch) =>
        set((s) => ({ categories: s.categories.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),
      deleteCategory: (id) =>
        set((s) => ({ categories: s.categories.filter((c) => c.id !== id) })),

      addTask: (task) => {
        const id = uuid();
        const newTask: Task = {
          id,
          title: task.title,
          description: task.description || '',
          date: task.date,
          time: task.time,
          duration: task.duration,
          priority: task.priority || 'normal',
          categoryId: task.categoryId,
          tags: task.tags || [],
          recurrence: task.recurrence || { freq: 'none' },
          reminder: task.reminder,
          subtasks: task.subtasks || [],
          status: task.status || 'pending',
          completedDates: [],
          skippedDates: [],
          goalId: task.goalId,
          createdAt: now(),
        };
        set((s) => ({ tasks: [...s.tasks, newTask] }));
        return id;
      },
      updateTask: (id, patch) =>
        set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),
      deleteTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),
      setTaskStatusForDate: (id, date, status) =>
        set((s) => ({
          tasks: s.tasks.map((t) => {
            if (t.id !== id) return t;
            if (t.recurrence.freq === 'none') {
              return { ...t, status, completedAt: status === 'completed' ? now() : t.completedAt };
            }
            const completedDates = t.completedDates.filter((d) => d !== date);
            const skippedDates = t.skippedDates.filter((d) => d !== date);
            if (status === 'completed') completedDates.push(date);
            if (status === 'skipped') skippedDates.push(date);
            return { ...t, completedDates, skippedDates };
          }),
        })),
      toggleSubtask: (taskId, subtaskId) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === taskId
              ? { ...t, subtasks: t.subtasks.map((st) => (st.id === subtaskId ? { ...st, done: !st.done } : st)) }
              : t,
          ),
        })),
      addSubtask: (taskId, title) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === taskId ? { ...t, subtasks: [...t.subtasks, { id: uuid(), title, done: false } as SubTask] } : t,
          ),
        })),
      deleteSubtask: (taskId, subtaskId) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === taskId ? { ...t, subtasks: t.subtasks.filter((st) => st.id !== subtaskId) } : t,
          ),
        })),

      addEvent: (event) => {
        const id = uuid();
        const newEvent: CalendarEvent = {
          id,
          title: event.title,
          date: event.date || new Date().toISOString().slice(0, 10),
          startTime: event.startTime || '09:00',
          endTime: event.endTime || '10:00',
          location: event.location || '',
          notes: event.notes || '',
          categoryId: event.categoryId,
          recurrence: event.recurrence || { freq: 'none' },
          reminder: event.reminder,
          status: 'pending',
          completedDates: [],
          skippedDates: [],
          createdAt: now(),
        };
        set((s) => ({ events: [...s.events, newEvent] }));
        return id;
      },
      updateEvent: (id, patch) =>
        set((s) => ({ events: s.events.map((e) => (e.id === id ? { ...e, ...patch } : e)) })),
      deleteEvent: (id) => set((s) => ({ events: s.events.filter((e) => e.id !== id) })),
      setEventStatusForDate: (id, date, status) =>
        set((s) => ({
          events: s.events.map((e) => {
            if (e.id !== id) return e;
            if (e.recurrence.freq === 'none') return { ...e, status };
            const completedDates = e.completedDates.filter((d) => d !== date);
            const skippedDates = e.skippedDates.filter((d) => d !== date);
            if (status === 'completed') completedDates.push(date);
            if (status === 'skipped') skippedDates.push(date);
            return { ...e, completedDates, skippedDates };
          }),
        })),

      addHabit: (habit) => {
        const id = uuid();
        const newHabit: Habit = {
          id,
          name: habit.name,
          icon: habit.icon || '⭐',
          recurrence: habit.recurrence || { freq: 'daily' },
          categoryId: habit.categoryId,
          reminderTime: habit.reminderTime,
          createdAt: now(),
        };
        set((s) => ({ habits: [...s.habits, newHabit] }));
        return id;
      },
      updateHabit: (id, patch) =>
        set((s) => ({ habits: s.habits.map((h) => (h.id === id ? { ...h, ...patch } : h)) })),
      deleteHabit: (id) =>
        set((s) => ({ habits: s.habits.filter((h) => h.id !== id), habitLogs: s.habitLogs.filter((l) => l.habitId !== id) })),
      toggleHabitLog: (habitId, date) =>
        set((s) => {
          const existing = s.habitLogs.find((l) => l.habitId === habitId && l.date === date);
          if (existing) {
            return { habitLogs: s.habitLogs.map((l) => (l.id === existing.id ? { ...l, done: !l.done } : l)) };
          }
          return { habitLogs: [...s.habitLogs, { id: uuid(), habitId, date, done: true }] };
        }),

      addGoal: (goal) => {
        const id = uuid();
        const newGoal: Goal = {
          id,
          title: goal.title,
          description: goal.description || '',
          period: goal.period,
          date: goal.date || new Date().toISOString().slice(0, 10),
          categoryId: goal.categoryId,
          steps: goal.steps || [],
          createdAt: now(),
        };
        set((s) => ({ goals: [...s.goals, newGoal] }));
        return id;
      },
      updateGoal: (id, patch) =>
        set((s) => ({ goals: s.goals.map((g) => (g.id === id ? { ...g, ...patch } : g)) })),
      deleteGoal: (id) => set((s) => ({ goals: s.goals.filter((g) => g.id !== id) })),
      addGoalStep: (goalId, title) =>
        set((s) => ({
          goals: s.goals.map((g) =>
            g.id === goalId ? { ...g, steps: [...g.steps, { id: uuid(), title, status: 'pending' } as GoalStep] } : g,
          ),
        })),
      updateGoalStep: (goalId, stepId, patch) =>
        set((s) => ({
          goals: s.goals.map((g) =>
            g.id === goalId ? { ...g, steps: g.steps.map((st) => (st.id === stepId ? { ...st, ...patch } : st)) } : g,
          ),
        })),
      cycleGoalStep: (goalId, stepId) =>
        set((s) => ({
          goals: s.goals.map((g) => {
            if (g.id !== goalId) return g;
            return {
              ...g,
              steps: g.steps.map((st) => {
                if (st.id !== stepId) return st;
                const next = st.status === 'pending' ? 'in_progress' : st.status === 'in_progress' ? 'done' : 'pending';
                return { ...st, status: next };
              }),
            };
          }),
        })),
      deleteGoalStep: (goalId, stepId) =>
        set((s) => ({
          goals: s.goals.map((g) => (g.id === goalId ? { ...g, steps: g.steps.filter((st) => st.id !== stepId) } : g)),
        })),

      addReminder: (reminder) => {
        const id = uuid();
        const newReminder: Reminder = {
          id,
          title: reminder.title,
          date: reminder.date || new Date().toISOString().slice(0, 10),
          time: reminder.time || '09:00',
          type: reminder.type || 'custom',
          linkedId: reminder.linkedId,
          recurrence: reminder.recurrence || { freq: 'none' },
          minutesBefore: reminder.minutesBefore ?? 0,
          done: false,
          createdAt: now(),
        };
        set((s) => ({ reminders: [...s.reminders, newReminder] }));
        return id;
      },
      updateReminder: (id, patch) =>
        set((s) => ({ reminders: s.reminders.map((r) => (r.id === id ? { ...r, ...patch } : r)) })),
      deleteReminder: (id) => set((s) => ({ reminders: s.reminders.filter((r) => r.id !== id) })),
      toggleReminderDone: (id) =>
        set((s) => ({ reminders: s.reminders.map((r) => (r.id === id ? { ...r, done: !r.done } : r)) })),

      addNote: (note) => {
        const id = uuid();
        const newNote: Note = {
          id,
          title: note.title,
          content: note.content || '',
          type: note.type || 'quick',
          listItems: note.listItems,
          linkedTaskId: note.linkedTaskId,
          linkedGoalId: note.linkedGoalId,
          categoryId: note.categoryId,
          pinned: false,
          createdAt: now(),
          updatedAt: now(),
        };
        set((s) => ({ notes: [newNote, ...s.notes] }));
        return id;
      },
      updateNote: (id, patch) =>
        set((s) => ({ notes: s.notes.map((n) => (n.id === id ? { ...n, ...patch, updatedAt: now() } : n)) })),
      deleteNote: (id) => set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),
      togglePinNote: (id) =>
        set((s) => ({ notes: s.notes.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n)) })),

      addRoutine: (routine) => {
        const id = uuid();
        const newRoutine: Routine = {
          id,
          name: routine.name,
          type: routine.type,
          icon: routine.icon || (routine.type === 'morning' ? '🌅' : routine.type === 'night' ? '🌙' : '⭐'),
          steps: routine.steps || [],
          activeDays: routine.activeDays || [0, 1, 2, 3, 4, 5, 6],
          enabled: routine.enabled ?? true,
          createdAt: now(),
        };
        set((s) => ({ routines: [...s.routines, newRoutine] }));
        return id;
      },
      updateRoutine: (id, patch) =>
        set((s) => ({ routines: s.routines.map((r) => (r.id === id ? { ...r, ...patch } : r)) })),
      deleteRoutine: (id) => set((s) => ({ routines: s.routines.filter((r) => r.id !== id) })),
      addRoutineStep: (routineId, time, title) =>
        set((s) => ({
          routines: s.routines.map((r) =>
            r.id === routineId ? { ...r, steps: [...r.steps, { id: uuid(), time, title }].sort((a, b) => a.time.localeCompare(b.time)) } : r,
          ),
        })),
      updateRoutineStep: (routineId, stepId, patch) =>
        set((s) => ({
          routines: s.routines.map((r) =>
            r.id === routineId
              ? { ...r, steps: r.steps.map((st) => (st.id === stepId ? { ...st, ...patch } : st)).sort((a, b) => a.time.localeCompare(b.time)) }
              : r,
          ),
        })),
      deleteRoutineStep: (routineId, stepId) =>
        set((s) => ({
          routines: s.routines.map((r) => (r.id === routineId ? { ...r, steps: r.steps.filter((st) => st.id !== stepId) } : r)),
        })),
      setRoutineStepStatus: (routineId, stepId, date, status) =>
        set((s) => ({
          routineStepStatus: { ...s.routineStepStatus, [`${date}:${routineId}:${stepId}`]: status },
        })),

      addInboxItem: (text) =>
        set((s) => ({ inboxItems: [{ id: uuid(), text, createdAt: now() }, ...s.inboxItems] })),
      deleteInboxItem: (id) => set((s) => ({ inboxItems: s.inboxItems.filter((i) => i.id !== id) })),
      convertInboxItem: (id, type) => {
        const item = get().inboxItems.find((i) => i.id === id);
        if (!item) return;
        if (type === 'task') get().addTask({ title: item.text });
        if (type === 'event') get().addEvent({ title: item.text, date: new Date().toISOString().slice(0, 10) });
        if (type === 'note') get().addNote({ title: item.text, type: 'quick' });
        if (type === 'reminder') get().addReminder({ title: item.text });
        get().deleteInboxItem(id);
      },

      setDailyOrder: (date, order) =>
        set((s) => ({ dailyOrder: { ...s.dailyOrder, [date]: order } })),

      updateProfile: (patch) => set((s) => ({ profile: { ...s.profile, ...patch }, onboarded: true })),

      resetDemoData: () => set(() => ({ categories: DEFAULT_CATEGORIES, ...buildSeedData(), routineStepStatus: {}, dailyOrder: {} })),
      clearAllData: () =>
        set(() => ({
          categories: DEFAULT_CATEGORIES,
          tasks: [], events: [], habits: [], habitLogs: [], goals: [], reminders: [], notes: [],
          routines: [], routineStepStatus: {}, inboxItems: [], dailyOrder: {},
        })),
    }),
    {
      name: 'centro-organizacion-store-v1',
    },
  ),
);

// ---- Derived selectors / helpers ----

export function tasksOnDate(tasks: Task[], date: string): Task[] {
  return tasks.filter((t) => {
    if (!t.date) return false;
    if (t.recurrence.freq === 'none') return t.date === date;
    return occursOnDate(t.date, t.recurrence, date);
  });
}

export function eventsOnDate(events: CalendarEvent[], date: string): CalendarEvent[] {
  return events.filter((e) => occursOnDate(e.date, e.recurrence, date));
}

export function taskStatusOnDate(t: Task, date: string): TaskStatus {
  if (t.recurrence.freq === 'none') return t.status;
  if (t.completedDates.includes(date)) return 'completed';
  if (t.skippedDates.includes(date)) return 'skipped';
  return 'pending';
}

export function eventStatusOnDate(e: CalendarEvent, date: string): TaskStatus {
  if (e.recurrence.freq === 'none') return e.status;
  if (e.completedDates.includes(date)) return 'completed';
  if (e.skippedDates.includes(date)) return 'skipped';
  return 'pending';
}

export function routineActiveOnDate(r: Routine, date: string): boolean {
  const day = new Date(date + 'T00:00:00').getDay();
  return r.enabled && r.activeDays.includes(day);
}
