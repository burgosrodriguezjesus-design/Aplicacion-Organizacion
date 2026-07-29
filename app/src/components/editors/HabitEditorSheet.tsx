import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Sheet } from '../ui/Sheet';
import { Button, IconButton } from '../ui/Button';
import { Input, Select, Label } from '../ui/Field';
import { useStore } from '../../store/store';
import { useUiStore } from '../../store/uiStore';
import type { RecurrenceFreq } from '../../types';
import { WEEKDAY_LABELS_SHORT } from '../../lib/date';

const HABIT_ICONS = ['💧', '🏋️', '📖', '😴', '🧘', '🦷', '🧹', '💊', '🚶', '🥗', '☀️', '💰'];
const FREQ_LABELS: Record<RecurrenceFreq, string> = {
  none: 'Una vez', daily: 'Todos los días', weekdays: 'Días laborables', weekly: 'Semanal',
  biweekly: 'Cada 2 semanas', monthly: 'Mensual', yearly: 'Anual', custom: 'Días concretos',
};

export function HabitEditorSheet() {
  const editingId = useUiStore((s) => s.editingHabitId);
  const setEditingId = useUiStore((s) => s.setEditingHabitId);
  const habit = useStore((s) => s.habits.find((h) => h.id === editingId));
  const categories = useStore((s) => s.categories);
  const addHabit = useStore((s) => s.addHabit);
  const updateHabit = useStore((s) => s.updateHabit);
  const deleteHabit = useStore((s) => s.deleteHabit);

  const isNew = editingId === 'new';
  const open = editingId !== null;

  const [name, setName] = useState('');
  const [icon, setIcon] = useState('⭐');
  const [freq, setFreq] = useState<RecurrenceFreq>('daily');
  const [days, setDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const [reminderTime, setReminderTime] = useState('');

  useEffect(() => {
    if (isNew) {
      setName(''); setIcon('⭐'); setFreq('daily'); setDays([0, 1, 2, 3, 4, 5, 6]); setCategoryId(undefined); setReminderTime('');
    } else if (habit) {
      setName(habit.name); setIcon(habit.icon); setFreq(habit.recurrence.freq);
      setDays(habit.recurrence.daysOfWeek || [0, 1, 2, 3, 4, 5, 6]); setCategoryId(habit.categoryId);
      setReminderTime(habit.reminderTime || '');
    }
  }, [editingId, isNew, habit]);

  if (!open || (!isNew && !habit)) return null;

  const close = () => setEditingId(null);

  const toggleDay = (d: number) => setDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort()));

  const save = () => {
    if (!name.trim()) return;
    const payload = {
      name: name.trim(), icon,
      recurrence: { freq, daysOfWeek: freq === 'custom' ? days : undefined },
      categoryId, reminderTime: reminderTime || undefined,
    };
    if (isNew) addHabit(payload);
    else if (habit) updateHabit(habit.id, payload);
    close();
  };

  const remove = () => {
    if (habit) deleteHabit(habit.id);
    close();
  };

  return (
    <Sheet
      open
      onClose={close}
      title={isNew ? 'Nuevo hábito' : 'Editar hábito'}
      footer={
        <div className="flex gap-2">
          {!isNew && <IconButton onClick={remove} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"><Trash2 size={18} /></IconButton>}
          <Button variant="primary" fullWidth onClick={save} disabled={!name.trim()}>Guardar</Button>
        </div>
      }
    >
      <div className="space-y-4">
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

        <div>
          <Label>Frecuencia</Label>
          <Select value={freq} onChange={(e) => setFreq(e.target.value as RecurrenceFreq)}>
            {(['daily', 'weekdays', 'weekly', 'custom'] as RecurrenceFreq[]).map((f) => <option key={f} value={f}>{FREQ_LABELS[f]}</option>)}
          </Select>
        </div>

        {freq === 'custom' && (
          <div>
            <Label>Días</Label>
            <div className="flex gap-1.5">
              {WEEKDAY_LABELS_SHORT.map((label, i) => (
                <button
                  key={i}
                  onClick={() => toggleDay(i)}
                  className={`flex h-9 w-9 items-center justify-center rounded-full border text-xs font-semibold transition-colors ${
                    days.includes(i) ? 'border-accent bg-accent text-white' : 'border-zinc-200 text-zinc-500 dark:border-zinc-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label>Categoría</Label>
            <Select value={categoryId || ''} onChange={(e) => setCategoryId(e.target.value || undefined)}>
              <option value="">Sin categoría</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </Select>
          </div>
          <div>
            <Label>Recordatorio</Label>
            <Input type="time" value={reminderTime} onChange={(e) => setReminderTime(e.target.value)} />
          </div>
        </div>
      </div>
    </Sheet>
  );
}
