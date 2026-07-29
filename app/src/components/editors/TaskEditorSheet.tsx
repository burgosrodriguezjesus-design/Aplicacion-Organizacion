import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Sheet } from '../ui/Sheet';
import { Button, IconButton } from '../ui/Button';
import { Input, Textarea, Select, Label } from '../ui/Field';
import { useStore } from '../../store/store';
import { useUiStore } from '../../store/uiStore';
import { PRIORITY_META, type Priority, type RecurrenceFreq, type SubTask } from '../../types';
import { todayKey } from '../../lib/date';

const RECURRENCE_LABELS: Record<RecurrenceFreq, string> = {
  none: 'No se repite', daily: 'Todos los días', weekdays: 'Días laborables', weekly: 'Cada semana',
  biweekly: 'Cada 2 semanas', monthly: 'Cada mes', yearly: 'Cada año', custom: 'Personalizado',
};

export function TaskEditorSheet() {
  const editingId = useUiStore((s) => s.editingTaskId);
  const setEditingId = useUiStore((s) => s.setEditingTaskId);
  const task = useStore((s) => s.tasks.find((t) => t.id === editingId));
  const categories = useStore((s) => s.categories);
  const addTask = useStore((s) => s.addTask);
  const updateTask = useStore((s) => s.updateTask);
  const deleteTask = useStore((s) => s.deleteTask);
  const toggleSubtask = useStore((s) => s.toggleSubtask);
  const addSubtask = useStore((s) => s.addSubtask);
  const deleteSubtask = useStore((s) => s.deleteSubtask);

  const isNew = editingId === 'new';
  const open = editingId !== null;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(todayKey());
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState<number | ''>('');
  const [priority, setPriority] = useState<Priority>('normal');
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const [tags, setTags] = useState('');
  const [recurrenceFreq, setRecurrenceFreq] = useState<RecurrenceFreq>('none');
  const [reminderOn, setReminderOn] = useState(false);
  const [reminderMinutes, setReminderMinutes] = useState(10);
  const [newSubtask, setNewSubtask] = useState('');

  useEffect(() => {
    if (isNew) {
      setTitle(''); setDescription(''); setDate(todayKey()); setTime(''); setDuration('');
      setPriority('normal'); setCategoryId(undefined); setTags(''); setRecurrenceFreq('none');
      setReminderOn(false); setReminderMinutes(10);
    } else if (task) {
      setTitle(task.title); setDescription(task.description || ''); setDate(task.date || todayKey());
      setTime(task.time || ''); setDuration(task.duration ?? ''); setPriority(task.priority);
      setCategoryId(task.categoryId); setTags(task.tags.join(', ')); setRecurrenceFreq(task.recurrence.freq);
      setReminderOn(!!task.reminder?.enabled); setReminderMinutes(task.reminder?.minutesBefore ?? 10);
    }
  }, [editingId, isNew, task]);

  if (!open || (!isNew && !task)) return null;

  const close = () => setEditingId(null);

  const save = () => {
    if (!title.trim()) return;
    const payload = {
      title: title.trim(),
      description,
      date: date || undefined,
      time: time || undefined,
      duration: duration === '' ? undefined : Number(duration),
      priority,
      categoryId,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      recurrence: { freq: recurrenceFreq },
      reminder: reminderOn ? { enabled: true, minutesBefore: reminderMinutes } : undefined,
    };
    if (isNew) addTask(payload);
    else if (task) updateTask(task.id, payload);
    close();
  };

  const remove = () => {
    if (task) deleteTask(task.id);
    close();
  };

  return (
    <Sheet
      open
      onClose={close}
      title={isNew ? 'Nueva tarea' : 'Editar tarea'}
      footer={
        <div className="flex gap-2">
          {!isNew && <IconButton onClick={remove} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"><Trash2 size={18} /></IconButton>}
          <Button variant="primary" fullWidth onClick={save} disabled={!title.trim()}>Guardar</Button>
        </div>
      }
    >
      <div className="space-y-4">
        <Input autoFocus placeholder="Nombre de la tarea" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Textarea placeholder="Descripción (opcional)" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />

        <div className="grid grid-cols-3 gap-2">
          <div>
            <Label>Fecha</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <Label>Hora</Label>
            <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </div>
          <div>
            <Label>Duración (min)</Label>
            <Input type="number" min={0} step={5} value={duration} onChange={(e) => setDuration(e.target.value === '' ? '' : Number(e.target.value))} />
          </div>
        </div>

        <div>
          <Label>Prioridad</Label>
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(PRIORITY_META) as Priority[]).map((p) => (
              <button
                key={p}
                onClick={() => setPriority(p)}
                className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                  priority === p ? 'border-accent bg-accent/10 text-accent' : 'border-zinc-200 text-zinc-500 dark:border-zinc-700'
                }`}
              >
                {PRIORITY_META[p].emoji} {PRIORITY_META[p].label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label>Categoría</Label>
            <Select value={categoryId || ''} onChange={(e) => setCategoryId(e.target.value || undefined)}>
              <option value="">Sin categoría</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </Select>
          </div>
          <div>
            <Label>Repetición</Label>
            <Select value={recurrenceFreq} onChange={(e) => setRecurrenceFreq(e.target.value as RecurrenceFreq)}>
              {(Object.keys(RECURRENCE_LABELS) as RecurrenceFreq[]).map((f) => <option key={f} value={f}>{RECURRENCE_LABELS[f]}</option>)}
            </Select>
          </div>
        </div>

        <div>
          <Label>Etiquetas (separadas por coma)</Label>
          <Input placeholder="urgente, casa..." value={tags} onChange={(e) => setTags(e.target.value)} />
        </div>

        <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
          <input type="checkbox" checked={reminderOn} onChange={(e) => setReminderOn(e.target.checked)} className="h-4 w-4 accent-[var(--accent)]" />
          Recordarme
          {reminderOn && (
            <Select value={reminderMinutes} onChange={(e) => setReminderMinutes(Number(e.target.value))} className="ml-1 w-auto">
              <option value={0}>a la hora exacta</option>
              <option value={5}>5 min antes</option>
              <option value={10}>10 min antes</option>
              <option value={30}>30 min antes</option>
              <option value={60}>1 hora antes</option>
            </Select>
          )}
        </label>

        {!isNew && task && (
          <div>
            <Label>Subtareas</Label>
            <div className="space-y-1.5">
              {task.subtasks.map((st: SubTask) => (
                <div key={st.id} className="flex items-center gap-2 rounded-lg px-1 py-1 hover:bg-zinc-50 dark:hover:bg-zinc-800/60">
                  <input type="checkbox" checked={st.done} onChange={() => toggleSubtask(task.id, st.id)} className="h-4 w-4 accent-[var(--accent)]" />
                  <span className={`flex-1 text-sm ${st.done ? 'text-zinc-400 line-through' : 'text-zinc-700 dark:text-zinc-200'}`}>{st.title}</span>
                  <IconButton size="sm" onClick={() => deleteSubtask(task.id, st.id)}><Trash2 size={14} /></IconButton>
                </div>
              ))}
              <div className="flex gap-1.5">
                <Input
                  placeholder="Añadir subtarea..."
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newSubtask.trim()) { addSubtask(task.id, newSubtask.trim()); setNewSubtask(''); }
                  }}
                />
                <IconButton
                  onClick={() => { if (newSubtask.trim()) { addSubtask(task.id, newSubtask.trim()); setNewSubtask(''); } }}
                >
                  <Plus size={16} />
                </IconButton>
              </div>
            </div>
          </div>
        )}
      </div>
    </Sheet>
  );
}
