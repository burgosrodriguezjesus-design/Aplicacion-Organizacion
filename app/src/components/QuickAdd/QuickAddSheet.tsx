import { useState } from 'react';
import { CheckSquare, CalendarDays, Repeat, Bell, StickyNote, ArrowLeft } from 'lucide-react';
import { Sheet } from '../ui/Sheet';
import { Button } from '../ui/Button';
import { Input, Textarea, Select, Label } from '../ui/Field';
import { useUiStore, type QuickAddType } from '../../store/uiStore';
import { useStore } from '../../store/store';
import { parseQuickAdd, formatParsedSummary } from '../../lib/nlp';
import { todayKey } from '../../lib/date';
import { PRIORITY_META, type Priority } from '../../types';

const TYPE_META: Record<QuickAddType, { label: string; icon: typeof CheckSquare; color: string }> = {
  task: { label: 'Tarea', icon: CheckSquare, color: '#6366f1' },
  event: { label: 'Evento', icon: CalendarDays, color: '#0ea5e9' },
  habit: { label: 'Hábito', icon: Repeat, color: '#22c55e' },
  reminder: { label: 'Recordatorio', icon: Bell, color: '#f97316' },
  note: { label: 'Nota', icon: StickyNote, color: '#eab308' },
};

export function QuickAddSheet() {
  const open = useUiStore((s) => s.quickAddOpen);
  const close = useUiStore((s) => s.closeQuickAdd);
  const openType = useUiStore((s) => s.openQuickAdd);

  if (!open) return null;

  return (
    <Sheet open onClose={close} title={open === 'menu' ? 'Añadir' : TYPE_META[open].label}>
      {open === 'menu' ? (
        <div className="grid grid-cols-3 gap-3 pb-2 pt-1 sm:grid-cols-5">
          {(Object.keys(TYPE_META) as QuickAddType[]).map((t) => {
            const meta = TYPE_META[t];
            const Icon = meta.icon;
            return (
              <button
                key={t}
                onClick={() => openType(t)}
                className="flex flex-col items-center gap-2 rounded-2xl border border-zinc-100 p-4 text-center transition-colors hover:border-accent/40 hover:bg-accent/5 dark:border-zinc-800"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: `${meta.color}1f`, color: meta.color }}>
                  <Icon size={20} />
                </span>
                <span className="text-xs font-medium text-zinc-700 dark:text-zinc-200">{meta.label}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <div>
          <button onClick={() => openType('menu')} className="mb-3 flex items-center gap-1 text-xs font-medium text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
            <ArrowLeft size={14} /> Cambiar tipo
          </button>
          {open === 'task' && <QuickTaskForm onDone={close} />}
          {open === 'event' && <QuickEventForm onDone={close} />}
          {open === 'habit' && <QuickHabitForm onDone={close} />}
          {open === 'reminder' && <QuickReminderForm onDone={close} />}
          {open === 'note' && <QuickNoteForm onDone={close} />}
        </div>
      )}
    </Sheet>
  );
}

function CategoryPicker({ value, onChange }: { value?: string; onChange: (v: string | undefined) => void }) {
  const categories = useStore((s) => s.categories);
  return (
    <Select value={value || ''} onChange={(e) => onChange(e.target.value || undefined)}>
      <option value="">Sin categoría</option>
      {categories.map((c) => (
        <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
      ))}
    </Select>
  );
}

function QuickTaskForm({ onDone }: { onDone: () => void }) {
  const addTask = useStore((s) => s.addTask);
  const [text, setText] = useState('');
  const [priority, setPriority] = useState<Priority | undefined>();
  const [categoryId, setCategoryId] = useState<string | undefined>();

  const parsed = text ? parseQuickAdd(text) : null;
  const summary = parsed ? formatParsedSummary(parsed) : '';

  const submit = () => {
    if (!text.trim()) return;
    const p = parseQuickAdd(text);
    addTask({ title: p.title, date: p.date, time: p.time, duration: p.duration, priority: priority || p.priority, categoryId });
    onDone();
  };

  return (
    <div className="space-y-3">
      <div>
        <Input
          autoFocus
          placeholder='Ej: "Estudiar electricidad mañana de 10 a 12"'
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
        />
        {summary && <p className="mt-1.5 pl-1 text-xs text-accent">✓ {summary}</p>}
      </div>
      <div>
        <Label>Prioridad</Label>
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(PRIORITY_META) as Priority[]).map((p) => (
            <button
              key={p}
              onClick={() => setPriority(priority === p ? undefined : p)}
              className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                priority === p ? 'border-accent bg-accent/10 text-accent' : 'border-zinc-200 text-zinc-500 dark:border-zinc-700'
              }`}
            >
              {PRIORITY_META[p].emoji} {PRIORITY_META[p].label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <Label>Categoría</Label>
        <CategoryPicker value={categoryId} onChange={setCategoryId} />
      </div>
      <Button variant="primary" fullWidth onClick={submit} disabled={!text.trim()}>Crear tarea</Button>
    </div>
  );
}

function QuickEventForm({ onDone }: { onDone: () => void }) {
  const addEvent = useStore((s) => s.addEvent);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(todayKey());
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [location, setLocation] = useState('');

  const submit = () => {
    if (!title.trim()) return;
    addEvent({ title, date, startTime, endTime, location });
    onDone();
  };

  return (
    <div className="space-y-3">
      <Input autoFocus placeholder="Título del evento" value={title} onChange={(e) => setTitle(e.target.value)} />
      <div className="grid grid-cols-3 gap-2">
        <div>
          <Label>Fecha</Label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div>
          <Label>Inicio</Label>
          <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
        </div>
        <div>
          <Label>Fin</Label>
          <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
        </div>
      </div>
      <Input placeholder="Ubicación (opcional)" value={location} onChange={(e) => setLocation(e.target.value)} />
      <Button variant="primary" fullWidth onClick={submit} disabled={!title.trim()}>Crear evento</Button>
    </div>
  );
}

const HABIT_ICONS = ['💧', '🏋️', '📖', '😴', '🧘', '🦷', '🧹', '💊', '🚶', '🥗'];

function QuickHabitForm({ onDone }: { onDone: () => void }) {
  const addHabit = useStore((s) => s.addHabit);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('⭐');

  const submit = () => {
    if (!name.trim()) return;
    addHabit({ name, icon, recurrence: { freq: 'daily' } });
    onDone();
  };

  return (
    <div className="space-y-3">
      <Input autoFocus placeholder="Ej: Beber agua" value={name} onChange={(e) => setName(e.target.value)} />
      <div>
        <Label>Icono</Label>
        <div className="flex flex-wrap gap-2">
          {HABIT_ICONS.map((ic) => (
            <button
              key={ic}
              onClick={() => setIcon(ic)}
              className={`flex h-10 w-10 items-center justify-center rounded-xl border text-lg transition-colors ${icon === ic ? 'border-accent bg-accent/10' : 'border-zinc-200 dark:border-zinc-700'}`}
            >
              {ic}
            </button>
          ))}
        </div>
      </div>
      <Button variant="primary" fullWidth onClick={submit} disabled={!name.trim()}>Crear hábito</Button>
    </div>
  );
}

function QuickReminderForm({ onDone }: { onDone: () => void }) {
  const addReminder = useStore((s) => s.addReminder);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(todayKey());
  const [time, setTime] = useState('09:00');

  const submit = () => {
    if (!title.trim()) return;
    addReminder({ title, date, time });
    onDone();
  };

  return (
    <div className="space-y-3">
      <Input autoFocus placeholder="Recordarme..." value={title} onChange={(e) => setTitle(e.target.value)} />
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>Fecha</Label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div>
          <Label>Hora</Label>
          <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </div>
      </div>
      <Button variant="primary" fullWidth onClick={submit} disabled={!title.trim()}>Crear recordatorio</Button>
    </div>
  );
}

function QuickNoteForm({ onDone }: { onDone: () => void }) {
  const addNote = useStore((s) => s.addNote);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const submit = () => {
    if (!title.trim()) return;
    addNote({ title, content, type: 'quick' });
    onDone();
  };

  return (
    <div className="space-y-3">
      <Input autoFocus placeholder="Título" value={title} onChange={(e) => setTitle(e.target.value)} />
      <Textarea placeholder="Escribe algo..." rows={4} value={content} onChange={(e) => setContent(e.target.value)} />
      <Button variant="primary" fullWidth onClick={submit} disabled={!title.trim()}>Guardar nota</Button>
    </div>
  );
}
