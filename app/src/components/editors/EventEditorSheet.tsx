import { useEffect, useState } from 'react';
import { Trash2, Heart } from 'lucide-react';
import { Sheet } from '../ui/Sheet';
import { Button, IconButton } from '../ui/Button';
import { Input, Textarea, Select, Label } from '../ui/Field';
import { useStore } from '../../store/store';
import { useUiStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { useSharedEventsStore } from '../../store/sharedEventsStore';
import type { RecurrenceFreq } from '../../types';
import { todayKey } from '../../lib/date';

const RECURRENCE_LABELS: Record<RecurrenceFreq, string> = {
  none: 'No se repite', daily: 'Todos los días', weekdays: 'Días laborables', weekly: 'Cada semana',
  biweekly: 'Cada 2 semanas', monthly: 'Cada mes', yearly: 'Cada año', custom: 'Personalizado',
};

export function EventEditorSheet() {
  const editingId = useUiStore((s) => s.editingEventId);
  const setEditingId = useUiStore((s) => s.setEditingEventId);
  const newItemDate = useUiStore((s) => s.newItemDate);
  const setNewItemDate = useUiStore((s) => s.setNewItemDate);

  const isShared = !!editingId?.startsWith('shared:');
  const rawId = editingId && isShared ? editingId.slice(7) : editingId;
  const isNew = editingId === 'new';
  const open = editingId !== null;

  const localEvent = useStore((s) => s.events.find((e) => e.id === rawId));
  const sharedEventRow = useSharedEventsStore((s) => s.events.find((e) => e.id === rawId));
  const event = isShared ? sharedEventRow : localEvent;

  const categories = useStore((s) => s.categories);
  const addEvent = useStore((s) => s.addEvent);
  const updateEvent = useStore((s) => s.updateEvent);
  const deleteEvent = useStore((s) => s.deleteEvent);

  const couple = useAuthStore((s) => s.couple);
  const user = useAuthStore((s) => s.user);
  const addSharedEvent = useSharedEventsStore((s) => s.addEvent);
  const updateSharedEvent = useSharedEventsStore((s) => s.updateEvent);
  const deleteSharedEvent = useSharedEventsStore((s) => s.deleteEvent);

  const [title, setTitle] = useState('');
  const [date, setDate] = useState(todayKey());
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const [recurrenceFreq, setRecurrenceFreq] = useState<RecurrenceFreq>('none');
  const [reminderOn, setReminderOn] = useState(false);
  const [reminderMinutes, setReminderMinutes] = useState(15);
  const [shareWithPartner, setShareWithPartner] = useState(false);

  useEffect(() => {
    if (isNew) {
      setTitle(''); setDate(newItemDate || todayKey()); setStartTime('09:00'); setEndTime('10:00');
      setLocation(''); setNotes(''); setCategoryId(undefined); setRecurrenceFreq('none');
      setReminderOn(false); setReminderMinutes(15); setShareWithPartner(false);
    } else if (event) {
      setTitle(event.title); setDate(event.date); setStartTime(event.startTime); setEndTime(event.endTime);
      setLocation(event.location || ''); setNotes(event.notes || '');
      if (!isShared && 'recurrence' in event) {
        setCategoryId(event.categoryId);
        setRecurrenceFreq(event.recurrence.freq);
        setReminderOn(!!event.reminder?.enabled);
        setReminderMinutes(event.reminder?.minutesBefore ?? 15);
      }
    }
  }, [editingId, isNew, event, isShared, newItemDate]);

  if (!open || (!isNew && !event)) return null;

  const close = () => { setEditingId(null); setNewItemDate(null); };

  const save = async () => {
    if (!title.trim()) return;

    if ((isNew && shareWithPartner) || (!isNew && isShared)) {
      if (!couple || !user) return;
      const payload = { title: title.trim(), date, startTime, endTime, location, notes };
      if (isNew) await addSharedEvent(couple.id, user.id, payload);
      else if (rawId) await updateSharedEvent(rawId, payload);
      close();
      return;
    }

    const payload = {
      title: title.trim(), date, startTime, endTime, location, notes, categoryId,
      recurrence: { freq: recurrenceFreq },
      reminder: reminderOn ? { enabled: true, minutesBefore: reminderMinutes } : undefined,
    };
    if (isNew) addEvent(payload);
    else if (localEvent) updateEvent(localEvent.id, payload);
    close();
  };

  const remove = async () => {
    if (isShared && rawId) await deleteSharedEvent(rawId);
    else if (localEvent) deleteEvent(localEvent.id);
    close();
  };

  return (
    <Sheet
      open
      onClose={close}
      title={isShared ? 'Evento en pareja' : isNew ? 'Nuevo evento' : 'Editar evento'}
      footer={
        <div className="flex gap-2">
          {!isNew && <IconButton onClick={remove} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"><Trash2 size={18} /></IconButton>}
          <Button variant="primary" fullWidth onClick={save} disabled={!title.trim()}>Guardar</Button>
        </div>
      }
    >
      <div className="space-y-4">
        {isShared && (
          <div className="flex items-center gap-2 rounded-xl bg-pink-50 px-3 py-2 text-xs text-pink-600 dark:bg-pink-950/30 dark:text-pink-400">
            <Heart size={14} fill="currentColor" /> Visible para ti y tu pareja
          </div>
        )}

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
        <Textarea placeholder="Notas (opcional)" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />

        {!isShared && (
          <>
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

            <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
              <input type="checkbox" checked={reminderOn} onChange={(e) => setReminderOn(e.target.checked)} className="h-4 w-4 accent-[var(--accent)]" />
              Recordarme
              {reminderOn && (
                <Select value={reminderMinutes} onChange={(e) => setReminderMinutes(Number(e.target.value))} className="ml-1 w-auto">
                  <option value={0}>a la hora exacta</option>
                  <option value={5}>5 min antes</option>
                  <option value={15}>15 min antes</option>
                  <option value={30}>30 min antes</option>
                  <option value={60}>1 hora antes</option>
                </Select>
              )}
            </label>
          </>
        )}

        {isNew && couple && (
          <label className="flex items-center gap-2 rounded-xl bg-pink-50 px-3 py-2.5 text-sm text-pink-700 dark:bg-pink-950/30 dark:text-pink-400">
            <input
              type="checkbox"
              checked={shareWithPartner}
              onChange={(e) => setShareWithPartner(e.target.checked)}
              className="h-4 w-4 accent-pink-500"
            />
            <Heart size={14} fill="currentColor" /> Compartir con mi pareja
          </label>
        )}
      </div>
    </Sheet>
  );
}
