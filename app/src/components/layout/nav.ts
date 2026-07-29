import { Home, CalendarDays, CheckSquare, Target, Menu } from 'lucide-react';

export const NAV_ITEMS = [
  { to: '/', label: 'Hoy', icon: Home, end: true },
  { to: '/calendario', label: 'Calendario', icon: CalendarDays },
  { to: '/tareas', label: 'Tareas', icon: CheckSquare },
  { to: '/objetivos', label: 'Objetivos', icon: Target },
  { to: '/mas', label: 'Más', icon: Menu },
] as const;
