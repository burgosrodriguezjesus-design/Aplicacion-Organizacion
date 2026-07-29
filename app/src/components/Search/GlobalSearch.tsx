import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, CheckSquare, CalendarDays, Repeat, Target, StickyNote, Bell } from 'lucide-react';
import { Sheet } from '../ui/Sheet';
import { Input } from '../ui/Field';
import { useUiStore } from '../../store/uiStore';
import { useStore } from '../../store/store';

interface Result {
  id: string;
  title: string;
  subtitle: string;
  icon: typeof Search;
  onSelect: () => void;
}

export function GlobalSearch() {
  const open = useUiStore((s) => s.searchOpen);
  const setOpen = useUiStore((s) => s.setSearchOpen);
  const setEditingTaskId = useUiStore((s) => s.setEditingTaskId);
  const setEditingEventId = useUiStore((s) => s.setEditingEventId);
  const setEditingHabitId = useUiStore((s) => s.setEditingHabitId);
  const setEditingGoalId = useUiStore((s) => s.setEditingGoalId);
  const setEditingNoteId = useUiStore((s) => s.setEditingNoteId);
  const navigate = useNavigate();

  const tasks = useStore((s) => s.tasks);
  const events = useStore((s) => s.events);
  const habits = useStore((s) => s.habits);
  const goals = useStore((s) => s.goals);
  const notes = useStore((s) => s.notes);
  const reminders = useStore((s) => s.reminders);

  const [query, setQuery] = useState('');

  const results = useMemo<Result[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const list: Result[] = [];

    for (const t of tasks) {
      if (t.title.toLowerCase().includes(q)) {
        list.push({
          id: `task-${t.id}`, title: t.title, subtitle: `Tarea${t.date ? ` · ${t.date}` : ''}`, icon: CheckSquare,
          onSelect: () => { navigate('/tareas'); setEditingTaskId(t.id); },
        });
      }
    }
    for (const e of events) {
      if (e.title.toLowerCase().includes(q)) {
        list.push({
          id: `event-${e.id}`, title: e.title, subtitle: `Evento · ${e.date} ${e.startTime}`, icon: CalendarDays,
          onSelect: () => { navigate('/calendario'); setEditingEventId(e.id); },
        });
      }
    }
    for (const h of habits) {
      if (h.name.toLowerCase().includes(q)) {
        list.push({
          id: `habit-${h.id}`, title: h.name, subtitle: 'Hábito', icon: Repeat,
          onSelect: () => { navigate('/mas/habitos'); setEditingHabitId(h.id); },
        });
      }
    }
    for (const g of goals) {
      if (g.title.toLowerCase().includes(q)) {
        list.push({
          id: `goal-${g.id}`, title: g.title, subtitle: 'Objetivo', icon: Target,
          onSelect: () => { navigate('/objetivos'); setEditingGoalId(g.id); },
        });
      }
    }
    for (const n of notes) {
      if (n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)) {
        list.push({
          id: `note-${n.id}`, title: n.title, subtitle: 'Nota', icon: StickyNote,
          onSelect: () => { navigate('/mas/notas'); setEditingNoteId(n.id); },
        });
      }
    }
    for (const r of reminders) {
      if (r.title.toLowerCase().includes(q)) {
        list.push({
          id: `reminder-${r.id}`, title: r.title, subtitle: `Recordatorio · ${r.date} ${r.time}`, icon: Bell,
          onSelect: () => { navigate('/mas/recordatorios'); },
        });
      }
    }
    return list.slice(0, 30);
  }, [query, tasks, events, habits, goals, notes, reminders, navigate, setEditingTaskId, setEditingEventId, setEditingHabitId, setEditingGoalId, setEditingNoteId]);

  const close = () => { setOpen(false); setQuery(''); };

  if (!open) return null;

  return (
    <Sheet open onClose={close} maxWidth="max-w-xl">
      <div className="-mx-1 -mt-1">
        <div className="relative">
          <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <Input
            autoFocus
            placeholder="Buscar tareas, eventos, hábitos, objetivos, notas..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="mt-3 max-h-96 space-y-1 overflow-y-auto">
          {query && results.length === 0 && (
            <p className="py-8 text-center text-sm text-zinc-400">Sin resultados para "{query}"</p>
          )}
          {results.map((r) => {
            const Icon = r.icon;
            return (
              <button
                key={r.id}
                onClick={() => { r.onSelect(); close(); }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <Icon size={17} className="shrink-0 text-zinc-400" />
                <span className="flex-1 truncate text-sm text-zinc-800 dark:text-zinc-100">{r.title}</span>
                <span className="shrink-0 text-xs text-zinc-400">{r.subtitle}</span>
              </button>
            );
          })}
        </div>
      </div>
    </Sheet>
  );
}
