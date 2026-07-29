import { v4 as uuid } from 'uuid';
import { dateKey } from '../lib/date';
import type {
  Category, Task, CalendarEvent, Habit, HabitLog, Goal, Reminder, Note, Routine, InboxItem, UserProfile,
} from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-personal', name: 'Personal', color: '#6366f1', icon: '🙂', builtin: true },
  { id: 'cat-trabajo', name: 'Trabajo', color: '#0ea5e9', icon: '💼', builtin: true },
  { id: 'cat-estudios', name: 'Estudios', color: '#8b5cf6', icon: '📚', builtin: true },
  { id: 'cat-entrenamiento', name: 'Entrenamiento', color: '#f97316', icon: '🏋️', builtin: true },
  { id: 'cat-salud', name: 'Salud', color: '#22c55e', icon: '💊', builtin: true },
  { id: 'cat-casa', name: 'Casa', color: '#a3703a', icon: '🏠', builtin: true },
  { id: 'cat-finanzas', name: 'Finanzas', color: '#14b8a6', icon: '💰', builtin: true },
  { id: 'cat-ocio', name: 'Ocio', color: '#ec4899', icon: '🎮', builtin: true },
  { id: 'cat-familia', name: 'Familia', color: '#eab308', icon: '👨‍👩‍👧', builtin: true },
  { id: 'cat-otros', name: 'Otros', color: '#64748b', icon: '📌', builtin: true },
];

export const DEFAULT_PROFILE: UserProfile = {
  name: 'Jesús',
  avatarEmoji: '🙂',
  theme: 'system',
  accentColor: '#6366f1',
  weekStartsOn: 1,
  pomodoroWork: 25,
  pomodoroBreak: 5,
  usualWake: '07:30',
  usualSleep: '23:30',
  notificationsEnabled: true,
};

export function buildSeedData(now: Date = new Date()) {
  const today = dateKey(now);

  const tasks: Task[] = [
    {
      id: uuid(), title: 'Estudiar electricidad', description: 'Tema 2: circuitos en paralelo',
      date: today, time: '09:00', duration: 120, priority: 'important', categoryId: 'cat-estudios',
      tags: ['electricidad'], recurrence: { freq: 'none' }, reminder: { enabled: true, minutesBefore: 10 },
      subtasks: [
        { id: uuid(), title: 'Terminar tema 1', done: true },
        { id: uuid(), title: 'Terminar tema 2', done: false },
      ],
      status: 'pending', completedDates: [], skippedDates: [], createdAt: now.toISOString(),
    },
    {
      id: uuid(), title: 'Revisar la moto', description: '', date: today, priority: 'normal',
      categoryId: 'cat-casa', tags: [], recurrence: { freq: 'none' }, subtasks: [],
      status: 'pending', completedDates: [], skippedDates: [], createdAt: now.toISOString(),
    },
    {
      id: uuid(), title: 'Comprar regalo para Alicia', priority: 'urgent', categoryId: 'cat-personal',
      tags: [], recurrence: { freq: 'none' }, subtasks: [], date: today,
      status: 'pending', completedDates: [], skippedDates: [], createdAt: now.toISOString(),
    },
    {
      id: uuid(), title: 'Responder correos pendientes', priority: 'low', categoryId: 'cat-trabajo',
      tags: [], recurrence: { freq: 'none' }, subtasks: [],
      status: 'pending', completedDates: [], skippedDates: [], createdAt: now.toISOString(),
    },
  ];

  const events: CalendarEvent[] = [
    {
      id: uuid(), title: 'Entrenamiento', date: today, startTime: '11:30', endTime: '13:00',
      location: 'Gimnasio', notes: '', categoryId: 'cat-entrenamiento', recurrence: { freq: 'weekdays' },
      reminder: { enabled: true, minutesBefore: 15 }, status: 'pending', completedDates: [], skippedDates: [],
      createdAt: now.toISOString(),
    },
    {
      id: uuid(), title: 'Trabajo', date: today, startTime: '15:00', endTime: '20:00',
      location: '', notes: '', categoryId: 'cat-trabajo', recurrence: { freq: 'weekdays' },
      status: 'pending', completedDates: [], skippedDates: [], createdAt: now.toISOString(),
    },
  ];

  const habits: Habit[] = [
    { id: uuid(), name: 'Beber agua', icon: '💧', recurrence: { freq: 'daily' }, createdAt: now.toISOString() },
    { id: uuid(), name: 'Entrenamiento', icon: '🏋️', recurrence: { freq: 'daily' }, createdAt: now.toISOString() },
    { id: uuid(), name: 'Lectura', icon: '📖', recurrence: { freq: 'daily' }, createdAt: now.toISOString() },
    { id: uuid(), name: 'Dormir 8h', icon: '😴', recurrence: { freq: 'daily' }, createdAt: now.toISOString() },
  ];
  const habitLogs: HabitLog[] = [];

  const goals: Goal[] = [
    {
      id: uuid(), title: 'Estudiar electricidad', period: 'monthly', date: today, categoryId: 'cat-estudios',
      steps: [
        { id: uuid(), title: 'Terminar tema 1', status: 'done' },
        { id: uuid(), title: 'Terminar tema 2', status: 'done' },
        { id: uuid(), title: 'Hacer ejercicios', status: 'in_progress' },
        { id: uuid(), title: 'Realizar examen', status: 'pending' },
        { id: uuid(), title: 'Repasar apuntes', status: 'pending' },
      ],
      createdAt: now.toISOString(),
    },
    {
      id: uuid(), title: 'Entrenar 4 veces esta semana', period: 'weekly', date: today, categoryId: 'cat-entrenamiento',
      steps: [
        { id: uuid(), title: 'Lunes', status: 'done' },
        { id: uuid(), title: 'Martes', status: 'done' },
        { id: uuid(), title: 'Jueves', status: 'pending' },
        { id: uuid(), title: 'Sábado', status: 'pending' },
      ],
      createdAt: now.toISOString(),
    },
  ];

  const reminders: Reminder[] = [
    {
      id: uuid(), title: 'Pagar recibo de la luz', date: today, time: '18:00', type: 'payment',
      recurrence: { freq: 'none' }, minutesBefore: 0, done: false, createdAt: now.toISOString(),
    },
  ];

  const notes: Note[] = [
    {
      id: uuid(), title: 'Ideas para el fin de semana', content: 'Excursión a la sierra, cine, quedar con Marcos',
      type: 'idea', createdAt: now.toISOString(), updatedAt: now.toISOString(),
    },
  ];

  const routines: Routine[] = [
    {
      id: uuid(), name: 'Rutina de mañana', type: 'morning', icon: '🌅', enabled: true, activeDays: [1, 2, 3, 4, 5],
      steps: [
        { id: uuid(), time: '07:30', title: 'Despertar' },
        { id: uuid(), time: '07:35', title: 'Beber agua' },
        { id: uuid(), time: '07:40', title: 'Ducha' },
        { id: uuid(), time: '08:00', title: 'Desayuno' },
      ],
      createdAt: now.toISOString(),
    },
    {
      id: uuid(), name: 'Rutina de noche', type: 'night', icon: '🌙', enabled: true, activeDays: [0, 1, 2, 3, 4, 5, 6],
      steps: [
        { id: uuid(), time: '22:30', title: 'Preparar cosas del día siguiente' },
        { id: uuid(), time: '23:00', title: 'Desconectar' },
        { id: uuid(), time: '23:30', title: 'Dormir' },
      ],
      createdAt: now.toISOString(),
    },
  ];

  const inboxItems: InboxItem[] = [
    { id: uuid(), text: 'Comprar leche', createdAt: now.toISOString() },
    { id: uuid(), text: 'Llamar al banco', createdAt: now.toISOString() },
  ];

  return { tasks, events, habits, habitLogs, goals, reminders, notes, routines, inboxItems };
}
