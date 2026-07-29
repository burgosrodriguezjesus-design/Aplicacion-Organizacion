import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Plus, Bell, Trash2 } from 'lucide-react';
import { useStore } from '../../store/store';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button, IconButton } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input, Select, Label } from '../../components/ui/Field';
import { Sheet } from '../../components/ui/Sheet';
import { EmptyState } from '../../components/ui/EmptyState';
import { todayKey } from '../../lib/date';
import type { ReminderType } from '../../types';

const TYPE_LABELS: Record<ReminderType, string> = {
  task: 'Tarea', event: 'Evento', habit: 'Hábito', payment: 'Pago', appointment: 'Cita', custom: 'Personalizado',
};

export function RemindersPage() {
  const reminders = useStore((s) => s.reminders);
  const addReminder = useStore((s) => s.addReminder);
  const deleteReminder = useStore((s) => s.deleteReminder);
  const toggleReminderDone = useStore((s) => s.toggleReminderDone);
  const [formOpen, setFormOpen] = useState(false);

  const { pending, done } = useMemo(() => {
    const sorted = [...reminders].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    return { pending: sorted.filter((r) => !r.done), done: sorted.filter((r) => r.done) };
  }, [reminders]);

  return (
    <div className="mx-auto max-w-2xl px-4 pt-6 sm:px-6 md:pt-10">
      <PageHeader
        title="Recordatorios"
        back
        subtitle="Nada importante se te pasará"
        action={<Button variant="primary" size="sm" onClick={() => setFormOpen(true)}><Plus size={16} /> Nuevo</Button>}
      />

      {reminders.length === 0 ? (
        <EmptyState icon={<Bell className="text-zinc-300" />} title="Sin recordatorios" subtitle="Crea recordatorios para pagos, citas o fechas importantes." />
      ) : (
        <div className="space-y-5">
          <div className="space-y-2">
            {pending.map((r) => (
              <Card key={r.id} className="flex items-center gap-3 p-3">
                <input type="checkbox" checked={r.done} onChange={() => toggleReminderDone(r.id)} className="h-4 w-4 accent-[var(--accent)]" />
                <Bell size={15} className="shrink-0 text-orange-400" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-100">{r.title}</p>
                  <p className="text-xs text-zinc-400">
                    {r.date === todayKey() ? 'Hoy' : format(new Date(r.date + 'T00:00:00'), "d 'de' MMM", { locale: es })} · {r.time} · {TYPE_LABELS[r.type]}
                  </p>
                </div>
                <IconButton size="sm" onClick={() => deleteReminder(r.id)} className="text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"><Trash2 size={14} /></IconButton>
              </Card>
            ))}
          </div>
          {done.length > 0 && (
            <div className="space-y-2 opacity-60">
              <p className="text-xs font-semibold uppercase text-zinc-400">Completados</p>
              {done.map((r) => (
                <Card key={r.id} className="flex items-center gap-3 p-3">
                  <input type="checkbox" checked={r.done} onChange={() => toggleReminderDone(r.id)} className="h-4 w-4 accent-[var(--accent)]" />
                  <p className="flex-1 truncate text-sm text-zinc-400 line-through">{r.title}</p>
                  <IconButton size="sm" onClick={() => deleteReminder(r.id)}><Trash2 size={14} /></IconButton>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      <NewReminderSheet open={formOpen} onClose={() => setFormOpen(false)} onSave={addReminder} />
    </div>
  );
}

function NewReminderSheet({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: (r: { title: string; date: string; time: string; type: ReminderType; minutesBefore: number }) => void }) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(todayKey());
  const [time, setTime] = useState('09:00');
  const [type, setType] = useState<ReminderType>('custom');
  const [minutesBefore, setMinutesBefore] = useState(0);

  const submit = () => {
    if (!title.trim()) return;
    onSave({ title: title.trim(), date, time, type, minutesBefore });
    setTitle('');
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} title="Nuevo recordatorio" footer={<Button variant="primary" fullWidth onClick={submit} disabled={!title.trim()}>Crear</Button>}>
      <div className="space-y-4">
        <Input autoFocus placeholder="Recordarme..." value={title} onChange={(e) => setTitle(e.target.value)} />
        <div className="grid grid-cols-2 gap-2">
          <div><Label>Fecha</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
          <div><Label>Hora</Label><Input type="time" value={time} onChange={(e) => setTime(e.target.value)} /></div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label>Tipo</Label>
            <Select value={type} onChange={(e) => setType(e.target.value as ReminderType)}>
              {(Object.keys(TYPE_LABELS) as ReminderType[]).map((t) => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
            </Select>
          </div>
          <div>
            <Label>Avisar</Label>
            <Select value={minutesBefore} onChange={(e) => setMinutesBefore(Number(e.target.value))}>
              <option value={0}>A la hora exacta</option>
              <option value={10}>10 min antes</option>
              <option value={30}>30 min antes</option>
              <option value={60}>1 hora antes</option>
              <option value={1440}>1 día antes</option>
            </Select>
          </div>
        </div>
      </div>
    </Sheet>
  );
}
